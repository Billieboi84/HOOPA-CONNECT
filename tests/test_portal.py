from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def test_required_portal_pages_exist():
    required = [
        ROOT / 'index.html',
        ROOT / 'admin.html',
        ROOT / 'directory.html',
        ROOT / 'jobs.html',
    ]
    for page in required:
        assert page.exists(), f'Missing required page: {page.name}'


def test_homepage_contains_key_portal_sections():
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    assert 'Local News & Events' in html
    assert 'Words from the Chairman' in html
    assert 'Community Directory' in html


def test_profile_page_contains_snapshot_sections():
    html = (ROOT / 'profile.html').read_text(encoding='utf-8')
    assert 'Community Snapshot' in html
    assert 'Quick Actions' in html


def test_listing_forms_support_status_selection():
    for page_name in ['create-listing.html', 'edit-listing.html']:
        html = (ROOT / page_name).read_text(encoding='utf-8')
        assert 'Listing status' in html
