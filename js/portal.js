(function () {
  function reportError(context, error) {
    // Single, visible error surface. Replace console sink with telemetry as needed.
    try {
      console.error('[portal] ' + context + ':', error);
    } catch (_) {
      /* ignore */
    }
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('error', function (event) {
      reportError('window.error', event.error || event.message);
    });
    window.addEventListener('unhandledrejection', function (event) {
      reportError('unhandledrejection', event.reason);
    });
  }
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

  function renderEmptyState(title, message, linkHref, linkLabel) {
    const action = linkHref && linkLabel
      ? `<a class="text-link" href="${esc(linkHref)}">${esc(linkLabel)}</a>`
      : '';
    return `
      <div class="portal-empty">
        <h4>${esc(title)}</h4>
        <p>${esc(message)}</p>
        ${action}
      </div>
    `;
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
        const hasRemoteData = remoteData && typeof remoteData === 'object' && (
          Object.prototype.hasOwnProperty.call(remoteData, 'news') ||
          Object.prototype.hasOwnProperty.call(remoteData, 'chairmanMessages') ||
          Object.prototype.hasOwnProperty.call(remoteData, 'directory') ||
          Object.prototype.hasOwnProperty.call(remoteData, 'jobs')
        );
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
      const articles = Array.isArray(data.news) ? data.news.slice(0, 3) : [];
      newsFeed.innerHTML = articles.length
        ? articles.map(buildNewsCard).join('')
        : renderEmptyState(
            'No stories posted yet',
            'Add a news item from the admin panel to populate the community feed.',
            'admin.html?portalAdmin=open',
            'Open admin'
          );
    }

    if (chairmanPreview) {
      const message = Array.isArray(data.chairmanMessages) ? data.chairmanMessages[0] : null;
      chairmanPreview.innerHTML = message ? `
        <div class="chairman-card">
          <img src="images/chairman-davis.jpeg" alt="Chairman Joe Davis">
          <div>
            <div class="chairman-badge">Message from the Chairman</div>
            <h4>${esc(message.title)}</h4>
            <p>${esc(message.body)}</p>
            <div class="meta-row"><span>${esc(message.date)}</span><a class="text-link" href="admin.html?portalAdmin=open">Update message</a></div>
          </div>
        </div>
      ` : renderEmptyState(
        'No chairman message available',
        'Publish the latest update from the admin panel to show it here.',
        'admin.html?portalAdmin=open',
        'Open admin'
      );
    }
  }

  function buildNewsCard(article) {
    const votes = getUserVotes();
    const userVote = votes['news:' + article.id] || null;
    const likeActive = userVote === 'like' ? ' vote-active' : '';
    const dislikeActive = userVote === 'dislike' ? ' vote-active' : '';
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
            <button class="vote-btn${likeActive}" data-action="vote" data-target="news" data-id="${esc(article.id)}" data-value="like">👍 ${esc(article.likes || 0)}</button>
            <button class="vote-btn${dislikeActive}" data-action="vote" data-target="news" data-id="${esc(article.id)}" data-value="dislike">👎 ${esc(article.dislikes || 0)}</button>
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
    const list = document.getElementById('directory-list');
    if (!list) return;

    // Fetch directory entries from Supabase
    let entries = [];
    try {
      var sb = window.__supabase;
      if (!sb) {
        console.warn('Supabase client not available, falling back to local data');
      } else {
        const { data, error } = await sb
          .from('directory_entries')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data && data.length) {
          entries = data;
        } else {
          console.warn('Supabase directory fetch returned no data or error:', error);
        }
      }
    } catch (e) {
      console.warn('Could not fetch directory from Supabase', e);
    }

    // Fallback to local data if Supabase fails
    if (!entries.length) {
      const data = await loadPortalData();
      entries = Array.isArray(data.directory) ? data.directory : [];
    }

    // Get filter values
    const kindFilter = document.getElementById('dir-filter-kind');
    const categoryFilter = document.getElementById('dir-filter-category');
    const searchFilter = document.getElementById('dir-filter-search');
    const kindVal = kindFilter ? kindFilter.value : 'all';
    const catVal = categoryFilter ? categoryFilter.value : 'all';
    const searchVal = searchFilter ? searchFilter.value.toLowerCase().trim() : '';

    // Apply filters
    let filtered = entries.filter(function (entry) {
      if (kindVal !== 'all' && entry.kind !== kindVal) return false;
      if (catVal !== 'all' && entry.category !== catVal) return false;
      if (searchVal && entry.name.toLowerCase().indexOf(searchVal) === -1) return false;
      return true;
    });
    list.innerHTML = filtered.length ? filtered.map(function (entry) {
      // Build Google Maps embed URL from coordinates or address
      var mapQuery = '';
      if (entry.latitude && entry.longitude) {
        mapQuery = entry.latitude + ',' + entry.longitude;
      } else if (entry.address) {
        mapQuery = encodeURIComponent(entry.address);
      } else {
        mapQuery = encodeURIComponent(entry.name + ' Hoopa CA');
      }
      var embedUrl = 'https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZNTgao-7Ltq8I&q=' + encodeURIComponent(mapQuery);
      var mapsUrl = entry.maps || 'https://maps.google.com/?q=' + encodeURIComponent(mapQuery);
      return '' +
      '<article class="portal-card">' +
        '<div class="portal-card-body">' +
          '<div class="portal-card-top">' +
            '<span class="card-badge">' + esc(entry.kind) + '</span>' +
            '<span class="card-distance">Local resource</span>' +
          '</div>' +
          '<h4>' + esc(entry.name) + '</h4>' +
          (entry.category ? '<span class="dir-category-tag">' + esc(entry.category) + '</span>' : '') +
          (entry.description ? '<p class="dir-description">' + esc(entry.description) + '</p>' : '') +
          (entry.address ? '<p>' + esc(entry.address) + '</p>' : '') +
          (entry.phone ? '<p>' + esc(entry.phone) + '</p>' : '') +
          '<div class="stats-row">' +
            (entry.website ? '<a class="text-link" href="' + esc(entry.website) + '" target="_blank" rel="noreferrer">Website</a>' : '') +
            '<a class="dir-map-btn" href="' + esc(mapsUrl) + '" target="_blank" rel="noreferrer">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>' +
              ' Open in Maps' +
            '</a>' +
          '</div>' +
          '<div class="dir-entry-map">' +
            '<iframe src="' + esc(embedUrl) + '&zoom=15" allowfullscreen loading="lazy"></iframe>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('') : renderEmptyState(
      'No directory entries match your filters',
      'Try adjusting the filters or add new entries from the admin panel.',
      'admin.html?portalAdmin=open',
      'Open admin'
    );
  }

  async function renderJobsPage() {
    const list = document.getElementById('jobs-list');
    if (!list) return;

    // Fetch jobs from Supabase
    let jobs = [];
    try {
      var sb = window.__supabase;
      if (sb) {
        const { data, error } = await sb
          .from('job_listings')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length) {
          jobs = data;
        } else {
          console.warn('Supabase jobs fetch returned no data or error:', error);
        }
      }
    } catch (e) {
      console.warn('Could not fetch jobs from Supabase', e);
    }

    // Fallback to local data if Supabase fails
    if (!jobs.length) {
      const data = await loadPortalData();
      jobs = Array.isArray(data.jobs) ? data.jobs : [];
    }

    // Get filter values
    var typeFilter = document.getElementById('filter-type');
    var catFilter = document.getElementById('filter-category');
    var searchFilter = document.getElementById('filter-search');
    var typeVal = typeFilter ? typeFilter.value : '';
    var catVal = catFilter ? catFilter.value : '';
    var searchVal = searchFilter ? searchFilter.value.toLowerCase().trim() : '';

    // Apply filters
    var filtered = jobs.filter(function (job) {
      if (typeVal && job.type !== typeVal) return false;
      if (catVal && job.category !== catVal) return false;
      if (searchVal && job.title.toLowerCase().indexOf(searchVal) === -1 && job.employer.toLowerCase().indexOf(searchVal) === -1) return false;
      return true;
    });

    if (!filtered.length) {
      list.innerHTML = '<div class="no-jobs"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg><h3>No jobs match your filters</h3><p style="color:#999;font-size:14px;">Try adjusting the filters or check back later.</p></div>';
      return;
    }

    list.innerHTML = filtered.map(function (job) {
      var badgeClass = 'badge-ft';
      if (job.type === 'Part-time') badgeClass = 'badge-pt';
      else if (job.type === 'Seasonal') badgeClass = 'badge-seasonal';

      var closingHtml = '';
      if (job.closing_date) {
        var isUrgent = job.closing_date.toLowerCase() === 'open until filled' ? false : true;
        closingHtml = '<span class="' + (isUrgent ? 'badge-closing' : '') + '" style="font-size:12px;">' + esc(job.closing_date) + '</span>';
      }

      var salaryHtml = job.salary ? '<span>💰 ' + esc(job.salary) + '</span>' : '';

      var applyBtn = job.link ? '<a class="btn-apply" href="' + esc(job.link) + '" target="_blank" rel="noreferrer">📝 Apply Online</a>' : '';
      var downloadBtn = job.download ? '<a class="btn-download" href="' + esc(job.download) + '" target="_blank" rel="noreferrer">📄 Download Application</a>' : '';

      return '' +
        '<div class="job-card">' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:6px;margin-bottom:6px;">' +
            '<h3>' + esc(job.title) + '</h3>' +
            '<span class="badge ' + badgeClass + '">' + esc(job.type) + '</span>' +
          '</div>' +
          '<div class="employer">🏢 ' + esc(job.employer) + ' &middot; ' + esc(job.location) + '</div>' +
          '<div class="meta">' +
            salaryHtml +
            closingHtml +
            (job.category ? '<span>📂 ' + esc(job.category) + '</span>' : '') +
          '</div>' +
          (job.summary ? '<div class="summary">' + esc(job.summary) + '</div>' : '') +
          '<div class="actions">' + applyBtn + downloadBtn + '</div>' +
        '</div>';
    }).join('');
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
          var nameVal = this.querySelector('[name="name"]').value.trim();
          var kindVal = this.querySelector('[name="kind"]').value.trim();
          var phoneVal = this.querySelector('[name="phone"]').value.trim();
          var addressVal = this.querySelector('[name="address"]').value.trim();
          var websiteVal = this.querySelector('[name="website"]').value.trim();
          var mapsVal = this.querySelector('[name="maps"]').value.trim();
          // Save to Supabase
          try {
            var sb = window.__supabase;
            if (sb) {
              await sb.from('directory_entries').insert({
                name: nameVal,
                kind: kindVal || 'Business',
                phone: phoneVal,
                address: addressVal,
                website: websiteVal,
                maps: mapsVal
              });
            }
          } catch (e) {
            console.warn('Could not save directory entry to Supabase', e);
          }

          // Also save to local data as fallback
          data.directory.unshift({
            id: 'dir-' + Date.now(),
            name: nameVal,
            kind: kindVal || 'Business',
            phone: phoneVal,
            address: addressVal,
            website: websiteVal,
            maps: mapsVal
          });
        }

        if (type === 'jobs') {
          var jobTitle = this.querySelector('[name="title"]').value.trim();
          var jobEmployer = this.querySelector('[name="employer"]').value.trim();
          var jobType = this.querySelector('[name="type"]').value.trim();
          var jobLocation = this.querySelector('[name="location"]').value.trim();
          var jobLink = this.querySelector('[name="link"]').value.trim();
          var jobDownload = this.querySelector('[name="download"]').value.trim();
          var jobSummary = this.querySelector('[name="summary"]').value.trim();
          // Save to Supabase
          try {
            var sb = window.__supabase;
            if (sb) {
              await sb.from('job_listings').insert({
                title: jobTitle,
                employer: jobEmployer,
                type: jobType || 'Full-time',
                location: jobLocation || 'Hoopa, CA',
                link: jobLink,
                download: jobDownload,
                summary: jobSummary
              });
            }
          } catch (e) {
            console.warn('Could not save job to Supabase', e);
          }
          // Also save to local data as fallback
          data.jobs.unshift({
            id: 'job-' + Date.now(),
            title: jobTitle,
            employer: jobEmployer,
            type: jobType || 'Full-time',
            location: jobLocation || 'Hoopa, CA',
            link: jobLink,
            download: jobDownload,
            summary: jobSummary
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

  const VOTE_STORAGE_KEY = 'hoopa-portal-votes-v1';

  function getUserVotes() {
    try {
      return JSON.parse(window.localStorage.getItem(VOTE_STORAGE_KEY)) || {};
    } catch (_) {
      return {};
    }
  }

  function saveUserVotes(votes) {
    try {
      window.localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(votes));
    } catch (_) { /* ignore */ }
  }

  async function handleVoting(event) {
    const button = event.target.closest('[data-action="vote"]');
    if (!button) return;
    const data = await loadPortalData();
    const target = button.dataset.target;
    const id = button.dataset.id;
    const value = button.dataset.value;
    const collection = Array.isArray(data[target]) ? data[target] : [];
    const entry = collection.find((item) => item.id === id);
    if (!entry) return;

    const votes = getUserVotes();
    const key = target + ':' + id;
    const previousVote = votes[key];

    // If the user already voted the same way, do nothing (prevent duplicate counting)
    if (previousVote === value) return;

    // If the user previously voted the opposite way, remove that vote first
    if (previousVote === 'like') entry.likes = Math.max(0, (entry.likes || 0) - 1);
    if (previousVote === 'dislike') entry.dislikes = Math.max(0, (entry.dislikes || 0) - 1);

    // Apply the new vote
    if (value === 'like') entry.likes = (entry.likes || 0) + 1;
    if (value === 'dislike') entry.dislikes = (entry.dislikes || 0) + 1;

    // Record the vote
    votes[key] = value;
    saveUserVotes(votes);

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
    const collection = Array.isArray(data[target]) ? data[target] : [];
    const entry = collection.find((item) => item.id === id);
    if (!entry) return;
    entry.comments = entry.comments || [];
    entry.comments.unshift(message);
    await savePortalData(data);
    form.reset();
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
    const boot = renderApp();
    if (boot && typeof boot.catch === 'function') {
      boot.catch(function (err) { reportError('renderApp.bootstrap', err); });
    }

    // Directory filter listeners
    var dirKind = document.getElementById('dir-filter-kind');
    var dirCat = document.getElementById('dir-filter-category');
    var dirSearch = document.getElementById('dir-filter-search');
    if (dirKind) {
      dirKind.addEventListener('change', function () { renderDirectoryPage(); });
    }
    if (dirCat) {
      dirCat.addEventListener('change', function () { renderDirectoryPage(); });
    }
    if (dirSearch) {
      var debounceTimer;
      dirSearch.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () { renderDirectoryPage(); }, 250);
      });
    }

    // Job filter listeners
    var jobType = document.getElementById('filter-type');
    var jobCat = document.getElementById('filter-category');
    var jobSearch = document.getElementById('filter-search');
    if (jobType) {
      jobType.addEventListener('change', function () { renderJobsPage(); });
    }
    if (jobCat) {
      jobCat.addEventListener('change', function () { renderJobsPage(); });
    }
    if (jobSearch) {
      var jobDebounce;
      jobSearch.addEventListener('input', function () {
        clearTimeout(jobDebounce);
        jobDebounce = setTimeout(function () { renderJobsPage(); }, 250);
      });
    }
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
