(function () {
  const STORAGE_KEY = 'hoopa-portal-data-v1';
  const sampleData = {
    news: [
      {
        id: 'news-1',
        title: 'Community Health Fair Returns This Weekend',
        summary: 'Free health screenings, food, and family activities will be available at the community center from 10 a.m. to 3 p.m.',
        body: 'Residents are invited to attend this weekend for health screenings, vaccination information, food, and family-friendly activities.',
        image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80',
        category: 'Event',
        likes: 24,
        dislikes: 1,
        comments: ['Great to see local support for families.']
      },
      {
        id: 'news-2',
        title: 'Tribal Youth Art Showcase Opens Thursday',
        summary: 'A new exhibit will highlight local artists and youth voices with live music and food vendors.',
        body: 'The showcase will feature student artwork, local music, and cultural demonstrations from community partners.',
        image: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=80',
        category: 'Culture',
        likes: 18,
        dislikes: 0,
        comments: ['Love seeing youth featured.']
      },
      {
        id: 'news-3',
        title: 'Roadwork Notice for Main Street Access',
        summary: 'Temporary delays are expected near the downtown corridor during the next two weeks.',
        body: 'Please allow extra travel time and watch for signage while crews complete resurfacing and utility work.',
        image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=900&q=80',
        category: 'Notice',
        likes: 9,
        dislikes: 2,
        comments: []
      }
    ],
    chairmanMessages: [
      {
        id: 'chair-1',
        title: 'Weekly Message from the Chairman',
        body: 'Thank you for staying engaged with the community. We are working together to strengthen local opportunities for families, workers, and small businesses.',
        date: '2026-07-01'
      }
    ],
    directory: [
      {
        id: 'dir-1',
        name: 'Hoopa Valley Tribe',
        kind: 'Tribal Entity',
        phone: '(530) 625-4000',
        address: 'P.O. Box 1258, Hoopa, CA',
        website: 'https://www.hoopa-nsn.gov',
        maps: 'https://maps.google.com/?q=Hoopa+California'
      },
      {
        id: 'dir-2',
        name: 'Yurok Tribe',
        kind: 'Tribal Entity',
        phone: '(707) 482-1350',
        address: 'P.O. Box 1027, Klamath, CA',
        website: 'https://www.yuroktribe.org',
        maps: 'https://maps.google.com/?q=Yurok+Tribe+Klamath'
      },
      {
        id: 'dir-3',
        name: 'Hoopa Valley Pharmacy',
        kind: 'Business',
        phone: '(530) 625-1000',
        address: 'Main Street, Hoopa, CA',
        website: 'https://maps.google.com/?q=Hoopa+Valley+Pharmacy',
        maps: 'https://maps.google.com/?q=Hoopa+Valley+Pharmacy'
      }
    ],
    jobs: [
      {
        id: 'job-1',
        title: 'Community Services Assistant',
        employer: 'Hoopa Valley Tribe',
        type: 'Full-time',
        location: 'Hoopa, CA',
        link: 'https://www.hoopa-nsn.gov',
        download: '#',
        summary: 'Support community outreach and program coordination.'
      },
      {
        id: 'job-2',
        title: 'Public Works Technician',
        employer: 'Yurok Tribe',
        type: 'Seasonal',
        location: 'Klamath, CA',
        link: 'https://www.yuroktribe.org',
        download: '#',
        summary: 'Assist with maintenance and field operations.'
      }
    ]
  };

  let portalData = null;

  function mergeDefaults(data) {
    const parsed = data || {};
    parsed.news = parsed.news || sampleData.news;
    parsed.chairmanMessages = parsed.chairmanMessages || sampleData.chairmanMessages;
    parsed.directory = parsed.directory || sampleData.directory;
    parsed.jobs = parsed.jobs || sampleData.jobs;
    return parsed;
  }

  function getLocalPortalData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = mergeDefaults(JSON.parse(JSON.stringify(sampleData)));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return mergeDefaults(JSON.parse(raw));
    } catch (error) {
      return mergeDefaults(JSON.parse(JSON.stringify(sampleData)));
    }
  }

  async function loadPortalData() {
    if (portalData) return portalData;

    portalData = getLocalPortalData();

    try {
      const { data: userData } = await supabaseClient.auth.getUser();
      const user = userData?.user;
      if (user) {
        const remoteData = user.user_metadata?.portal_data;
        const hasRemoteData = remoteData && typeof remoteData === 'object' && (remoteData.news || remoteData.chairmanMessages || remoteData.directory || remoteData.jobs);
        if (hasRemoteData) {
          portalData = mergeDefaults(remoteData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(portalData));
          return portalData;
        }
        await supabaseClient.auth.updateUser({ data: { portal_data: portalData } });
      }
    } catch (error) {
      console.warn('Portal sync unavailable', error);
    }

    return portalData;
  }

  async function savePortalData(data) {
    portalData = mergeDefaults(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portalData));

    try {
      const { data: userData } = await supabaseClient.auth.getUser();
      const user = userData?.user;
      if (user) {
        await supabaseClient.auth.updateUser({ data: { portal_data: portalData } });
      }
    } catch (error) {
      console.warn('Could not sync portal data to Supabase', error);
    }

    return portalData;
  }

  async function renderHomePage() {
    const data = await loadPortalData();
    const newsFeed = document.getElementById('news-feed');
    const chairmanPreview = document.getElementById('chairman-preview');

    if (newsFeed) {
      newsFeed.innerHTML = data.news.slice(0, 3).map(buildNewsCard).join('');
    }

    if (chairmanPreview) {
      const message = data.chairmanMessages[0];
      chairmanPreview.innerHTML = `
        <div class="chairman-card">
          <img src="images/chairman-davis.jpeg" alt="Chairman Joe Davis">
          <div>
            <div class="chairman-badge">Message from the Chairman</div>
            <h4>${esc(message.title)}</h4>
            <p>${esc(message.body)}</p>
            <div class="meta-row"><span>${esc(message.date)}</span><a class="text-link" href="admin.html?portalAdmin=open">Update message</a></div>
          </div>
        </div>
      `;
    }
  }

  function buildNewsCard(article) {
    return `
      <article class="portal-card">
        <img src="${esc(article.image || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=80')}" alt="${esc(article.title)}">
        <div class="portal-card-body">
          <div class="portal-card-top">
            <span class="card-badge">${esc(article.category || 'Update')}</span>
            <span class="card-distance">${esc(article.likes || 0)} likes</span>
          </div>
          <h4>${esc(article.title)}</h4>
          <p>${esc(article.summary || article.body || '')}</p>
          <div class="stats-row">
            <button class="vote-btn" data-action="vote" data-target="news" data-id="${esc(article.id)}" data-value="like">👍 ${esc(article.likes || 0)}</button>
            <button class="vote-btn" data-action="vote" data-target="news" data-id="${esc(article.id)}" data-value="dislike">👎 ${esc(article.dislikes || 0)}</button>
            <span class="comment-count">💬 ${esc((article.comments || []).length)}</span>
            <button class="text-link" type="button" data-open-article="${esc(article.id)}">Read more</button>
          </div>
          <div class="comment-thread">
            ${(article.comments || []).slice(0, 2).map((comment) => `<div class="comment-item">${esc(comment)}</div>`).join('')}
          </div>
          <form class="comment-form" data-action="comment" data-target="news" data-id="${esc(article.id)}">
            <input type="text" name="comment" placeholder="Add a comment" required>
            <button type="submit">Post</button>
          </form>
        </div>
      </article>
    `;
  }

  async function renderDirectoryPage() {
    const data = await loadPortalData();
    const list = document.getElementById('directory-list');
    if (!list) return;
    list.innerHTML = data.directory.map((entry) => `
      <article class="portal-card">
        <div class="portal-card-body">
          <div class="portal-card-top">
            <span class="card-badge">${esc(entry.kind)}</span>
            <span class="card-distance">Local resource</span>
          </div>
          <h4>${esc(entry.name)}</h4>
          <p>${esc(entry.address)}</p>
          <p>${esc(entry.phone)}</p>
          <div class="stats-row">
            <a class="text-link" href="${esc(entry.website)}" target="_blank" rel="noreferrer">Website</a>
            <a class="text-link" href="${esc(entry.maps)}" target="_blank" rel="noreferrer">Open in Maps</a>
          </div>
        </div>
      </article>
    `).join('');
  }

  async function renderJobsPage() {
    const data = await loadPortalData();
    const list = document.getElementById('jobs-list');
    if (!list) return;
    list.innerHTML = data.jobs.map((job) => `
      <article class="portal-card">
        <div class="portal-card-body">
          <div class="portal-card-top">
            <span class="card-badge">${esc(job.type)}</span>
            <span class="card-distance">${esc(job.location)}</span>
          </div>
          <h4>${esc(job.title)}</h4>
          <p><strong>${esc(job.employer)}</strong></p>
          <p>${esc(job.summary)}</p>
          <div class="stats-row">
            <a class="text-link" href="${esc(job.link)}" target="_blank" rel="noreferrer">Apply</a>
            <a class="text-link" href="${esc(job.download)}" target="_blank" rel="noreferrer">Download form</a>
          </div>
        </div>
      </article>
    `).join('');
  }

  function bindAdminForms() {
    const forms = document.querySelectorAll('form[data-admin-form]');
    forms.forEach((form) => {
      form.replaceWith(form.cloneNode(true));
    });

    const freshForms = document.querySelectorAll('form[data-admin-form]');
    freshForms.forEach((form) => {
      form.addEventListener('submit', async function (event) {
        event.preventDefault();
        const data = await loadPortalData();
        const type = this.dataset.adminForm;
        const status = document.getElementById('admin-status');

        if (type === 'chairman') {
          data.chairmanMessages.unshift({
            id: 'msg-' + Date.now(),
            title: this.querySelector('[name="title"]').value.trim(),
            body: this.querySelector('[name="body"]').value.trim(),
            date: this.querySelector('[name="date"]').value || new Date().toISOString().slice(0, 10)
          });
        }

        if (type === 'news') {
          data.news.unshift({
            id: 'news-' + Date.now(),
            title: this.querySelector('[name="title"]').value.trim(),
            summary: this.querySelector('[name="summary"]').value.trim(),
            body: this.querySelector('[name="body"]').value.trim(),
            image: this.querySelector('[name="image"]').value.trim() || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=80',
            category: this.querySelector('[name="category"]').value.trim() || 'Update',
            likes: 0,
            dislikes: 0,
            comments: []
          });
        }

        if (type === 'directory') {
          data.directory.unshift({
            id: 'dir-' + Date.now(),
            name: this.querySelector('[name="name"]').value.trim(),
            kind: this.querySelector('[name="kind"]').value.trim(),
            phone: this.querySelector('[name="phone"]').value.trim(),
            address: this.querySelector('[name="address"]').value.trim(),
            website: this.querySelector('[name="website"]').value.trim(),
            maps: this.querySelector('[name="maps"]').value.trim()
          });
        }

        if (type === 'jobs') {
          data.jobs.unshift({
            id: 'job-' + Date.now(),
            title: this.querySelector('[name="title"]').value.trim(),
            employer: this.querySelector('[name="employer"]').value.trim(),
            type: this.querySelector('[name="type"]').value.trim(),
            location: this.querySelector('[name="location"]').value.trim(),
            link: this.querySelector('[name="link"]').value.trim(),
            download: this.querySelector('[name="download"]').value.trim(),
            summary: this.querySelector('[name="summary"]').value.trim()
          });
        }

        await savePortalData(data);
        this.reset();
        if (status) {
          status.innerHTML = '<span class="status-success">Saved successfully. Your new content is now live.</span>';
        }
        await renderApp();
      });
    });
  }

  async function handleVoting(event) {
    const button = event.target.closest('[data-action="vote"]');
    if (!button) return;
    const data = await loadPortalData();
    const target = button.dataset.target;
    const id = button.dataset.id;
    const value = button.dataset.value;
    const entry = data[target].find((item) => item.id === id);
    if (!entry) return;
    if (value === 'like') entry.likes = (entry.likes || 0) + 1;
    if (value === 'dislike') entry.dislikes = (entry.dislikes || 0) + 1;
    await savePortalData(data);
    await renderApp();
  }

  async function handleCommentSubmission(event) {
    const form = event.target.closest('form[data-action="comment"]');
    if (!form) return;
    const message = form.querySelector('input[name="comment"]').value.trim();
    if (!message) return;
    const data = await loadPortalData();
    const target = form.dataset.target;
    const id = form.dataset.id;
    const entry = data[target].find((item) => item.id === id);
    if (!entry) return;
    entry.comments = entry.comments || [];
    entry.comments.unshift(message);
    await savePortalData(data);
    await renderApp();
  }

  async function openArticleModal(articleId) {
    const data = await loadPortalData();
    const article = data.news.find((item) => item.id === articleId);
    const modal = document.getElementById('article-modal');
    const content = document.getElementById('article-modal-content');
    if (!modal || !content || !article) return;
    content.innerHTML = `
      <h3>${esc(article.title)}</h3>
      <p><strong>${esc(article.category || 'Update')}</strong></p>
      <p>${esc(article.body || article.summary || '')}</p>
    `;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeArticleModal() {
    const modal = document.getElementById('article-modal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  async function renderApp() {
    await renderHomePage();
    await renderDirectoryPage();
    await renderJobsPage();
    bindAdminForms();
  }

  function showAdminAccessIfAuthorized() {
    const link = document.querySelector('.hidden-admin-link');
    if (!link) return;
    const currentUser = window.localStorage.getItem('hoopa-admin-user');
    const params = new URLSearchParams(window.location.search);
    const secret = params.get('portalAdmin');
    if (currentUser === 'authorized' || secret === 'open') {
      link.style.display = 'flex';
    }
  }

  window.openDrawer = function () {
    const drawer = document.getElementById('menu-drawer-backdrop');
    if (drawer) drawer.classList.add('open');
  };

  window.closeDrawer = function () {
    const drawer = document.getElementById('menu-drawer-backdrop');
    if (drawer) drawer.classList.remove('open');
  };

  document.addEventListener('DOMContentLoaded', function () {
    showAdminAccessIfAuthorized();
    renderApp();
  });

  document.addEventListener('click', function (event) {
    handleVoting(event);
    const openButton = event.target.closest('[data-open-article]');
    if (openButton) {
      event.preventDefault();
      openArticleModal(openButton.dataset.openArticle);
      return;
    }
    if (event.target.matches('[data-close-modal]')) {
      closeArticleModal();
    }
  });

  document.addEventListener('submit', function (event) {
    if (event.target.matches('form[data-action="comment"]')) {
      event.preventDefault();
      handleCommentSubmission(event);
    }
  });

  window.portalApp = { getPortalData: () => portalData, savePortalData, renderApp };
})();
