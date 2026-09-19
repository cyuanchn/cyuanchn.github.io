(() => {
  'use strict';
  const d = window.PROFILE;
  if (!d) return;
  const p = d.profile;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const content = value => esc(value).replace(/\[([^\]]+)\]/g, '<span class="placeholder">[$1]</span>');
  const safeUrl = (value, local = false) => {
    const url = String(value || '').trim();
    if (/^https?:\/\//i.test(url)) return esc(url);
    if (local && /^(?:\.\/)?assets\/[\w./%+@() -]+$/i.test(url) && !url.includes('..')) return esc(url);
    return '';
  };
  const external = (label, url, extra = '') => {
    const href = safeUrl(url, true);
    return href ? `<a href="${href}" target="_blank" rel="noopener noreferrer" ${extra}>${content(label)}</a>` : content(label);
  };
  const note = (key, text) => `<p class="fill-note"><strong>待补充</strong> · <code>${esc(key)}</code><br>${esc(text)}</p>`;
  const header = (en, zh, subtitle = '') => `<header class="page-header"><p class="eyebrow">${esc(zh)}</p><h1 lang="en">${esc(en)}</h1>${subtitle ? `<p class="subtitle">${esc(subtitle)}</p>` : ''}</header>`;
  const section = (title, zh, body) => `<section class="content-section"><h2>${esc(title)}${zh ? `<span class="zh-label">${esc(zh)}</span>` : ''}</h2>${body}</section>`;
  const heading = (title, zh) => `<h2>${esc(title)} <span class="zh-label">${esc(zh)}</span></h2>`;
  const empty = () => '<p class="empty-section">暂无条目。</p>';
  const arrow = '<span aria-hidden="true">→</span>';
  const icons = {
    pin: '<path d="M13.5 6.5c0 4-5.5 8-5.5 8s-5.5-4-5.5-8a5.5 5.5 0 0 1 11 0Z"/><circle cx="8" cy="6.5" r="1.7"/>',
    mail: '<rect x="1.5" y="3" width="13" height="10" rx="1"/><path d="m2 4 6 4.5L14 4"/>',
    link: '<path d="m6.5 9.5 3-3M5 6 3.5 7.5a3.5 3.5 0 0 0 5 5L10 11M6 5l1.5-1.5a3.5 3.5 0 0 1 5 5L11 10"/>',
    school: '<path d="m1 5 7-3 7 3-7 3-7-3Zm3 2v4c2.5 2 5.5 2 8 0V7M14 6v6"/>'
  };
  const icon = name => `<svg viewBox="0 0 16 16" aria-hidden="true">${icons[name] || icons.link}</svg>`;
  const missing = label => `<span class="social-missing">${esc(label)}<span class="missing-badge">待填</span></span>`;
  const email = String(p.email || '').trim();
  const emailValid = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email);
  const emailHtml = emailValid ? `<a href="mailto:${esc(encodeURI(email))}">${esc(email)}</a>` : content('[待填写：电子邮箱]');
  const usableLinks = p.links.filter(link => d.site.templateMode || safeUrl(link.url));
  const socialLinks = usableLinks.map(link => `<li>${icon(link.label === 'Google Scholar' ? 'school' : 'link')}${safeUrl(link.url) ? external(link.label, link.url) : missing(link.label)}</li>`).join('');
  const photo = safeUrl(p.photo, true);
  document.getElementById('profile').innerHTML = `
    <div class="portrait">${photo ? `<img id="portrait-image" src="${photo}" alt="${esc(p.nameEn)}的个人照片">` : '<span class="photo-word">PHOTO</span><span class="photo-note">待添加个人照片</span>'}</div>
    <div class="profile-summary"><h2 class="profile-name">${esc(p.nameEn)}${p.nameZh ? `<span class="profile-name-zh">${esc(p.nameZh)}</span>` : ''}</h2>
    <p class="profile-position">${content(p.position)}</p><p class="profile-institution">${content(p.department)}<br>${external(p.institution, p.institutionUrl)}</p><p class="profile-keywords">${content(p.researchKeywords)}</p></div>
    <ul class="profile-links"><li>${icon('pin')}${content(p.city)}</li><li>${icon('mail')}${emailHtml}</li>${socialLinks}</ul>
    <p class="profile-fill">可补充中文姓名、个人照片和学术主页链接。<br>资料在 <code>profile</code> 中统一修改。</p>`;
  const portraitImage = document.getElementById('portrait-image');
  if (portraitImage) portraitImage.addEventListener('error', () => {
    portraitImage.parentElement.innerHTML = '<span class="photo-word">PHOTO</span><span class="photo-note">请检查照片路径</span>';
  });
  document.getElementById('site-name').textContent = p.nameEn;
  document.querySelector('meta[name="description"]').content = d.site.description;
  document.getElementById('copyright').textContent = `© ${new Date().getFullYear()} ${p.nameEn}`;
  document.getElementById('last-updated').textContent = d.site.lastUpdated ? `Updated ${d.site.lastUpdated}` : '';
  document.body.classList.toggle('final-mode', !d.site.templateMode);

  const interests = () => (d.research.interestsAreExamples ? '<p class="example-label">研究方向示例 · 请确认或替换</p>' : '') + `<ol class="research-list">${d.research.interests.map((item, i) => `<li><span class="list-index" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><div><h3>${content(item.title)}</h3><p>${content(item.description)}</p></div></li>`).join('')}</ol>`;
  const routeEnabled = key => d.site.sections[key] !== false;
  document.getElementById('page-about').innerHTML = header('About me', '关于我') +
    `<div class="biography">${d.about.paragraphs.map(text => `<p>${content(text)}</p>`).join('')}${d.about.chineseBio ? `<p class="chinese-bio">${content(d.about.chineseBio)}</p>` : ''}</div>` +
    '<hr class="divider">' +
    section('Research interests', '研究兴趣', `<p>${content(d.about.researchSummary)}</p>${interests()}`) +
    `<div class="home-links">${routeEnabled('research') ? `<a class="section-link" href="#research">Research & publications ${arrow}</a>` : ''}${routeEnabled('cv') ? `<a class="section-link" href="#cv">Curriculum vitae ${arrow}</a>` : ''}</div>`;

  const pdf = (label, path) => {
    const href = safeUrl(path, true);
    return href ? `<a class="pdf-button" href="${href}" target="_blank" rel="noopener noreferrer">${esc(label)} <span aria-hidden="true">↗</span></a>` : (d.site.templateMode ? `<span class="pdf-button unavailable" aria-disabled="true">${esc(label)} <small>待添加 PDF</small></span>` : '');
  };
  const timeline = items => items.length ? `<ol class="timeline">${items.map(item => `<li><div class="period">${content(item.period)}</div><div><h3>${content(item.title)}</h3><p>${external(item.institution, item.url)}</p>${item.detail ? `<p class="detail">${content(item.detail)}</p>` : ''}${(item.details || []).map(text => `<p class="detail">${content(text)}</p>`).join('')}</div></li>`).join('')}</ol>` : empty();
  document.getElementById('page-cv').innerHTML = header('Curriculum vitae', '简历', 'Education & academic experience') +
    `<div class="download-row">${pdf('CV · English', d.cv.englishPdf)}${pdf('简历 · 中文', d.cv.chinesePdf)}</div>` +
    note('cv', '可补充编译好的英文或中文简历 PDF，作为下载版本。') +
    (d.cv.positions.length ? section('Appointments', '工作经历', timeline(d.cv.positions)) : '') + section('Education', '教育背景', timeline(d.cv.education)) +
    (d.cv.academicExperience?.length ? section('Academic experience', '学术组织经历', timeline(d.cv.academicExperience)) : '') +
    (d.cv.languages?.length ? section('Languages', '语言', `<ul class="list-simple">${d.cv.languages.map(text => `<li>${content(text)}</li>`).join('')}</ul>`) : '');

  const papers = items => items.length ? `<ol class="paper-list">${items.map(item => {
    const links = [['DOI', item.doi], ['arXiv', item.arxiv], ['PDF', item.pdf]].filter(([,url]) => safeUrl(url, true));
    return `<li class="paper"><h3 class="paper-title">${content(item.title)}</h3><p class="paper-authors">${content(item.authors)}</p><p class="paper-venue"><i>${content(item.venue)}</i>${item.year ? ` · ${content(item.year)}` : ''}</p>${links.length ? `<div class="paper-links">${links.map(([label,url]) => external(label, url)).join('')}</div>` : (d.site.templateMode ? '<p class="paper-hint">添加 DOI / arXiv / PDF 后，将在此显示对应链接。</p>' : '')}</li>`;
  }).join('')}</ol>` : empty();
  const talks = d.research.talks.length ? `<ol class="timeline">${d.research.talks.map(item => `<li><div class="period">${content(item.date)}</div><div><h3>${external(item.title, item.url)}</h3><p class="detail">${content(item.venue)}</p>${item.role ? `<p class="activity-role">${content(item.role)}</p>` : ''}</div></li>`).join('')}</ol>` : '';
  document.getElementById('page-research').innerHTML = header('Research', '研究', 'Interests, publications & academic activities') +
    section('Research interests', '研究方向', interests() + (d.research.statementPdf ? `<div class="download-row">${pdf('Research statement', d.research.statementPdf)}</div>` : '')) +
    note('research', '可补充期刊论文的 DOI 或 PDF，以及各次报告的具体题目。预印本状态和 arXiv 编号按所提供的 CV 保留。') +
    section('Publications', '已发表论文', papers(d.research.publications)) + section('Preprints', '预印本', papers(d.research.preprints)) +
    (talks ? section('Conferences & seminars', '会议与学术报告', talks) : '') +
    (d.research.service.length ? section('Academic service', '学术服务', `<ul class="list-simple">${d.research.service.map(text => `<li>${content(text)}</li>`).join('')}</ul>`) : '');

  const projects = d.grants.projects.length ? `<ol class="timeline">${d.grants.projects.map(item => `<li><div class="period">${content(item.period)}${item.status ? `<br><span class="grant-status">${content(item.status)}</span>` : ''}</div><div><h3>${content(item.title)}</h3><p>${content(item.agency)}</p><div class="grant-meta">${item.number ? `<span>Grant No. ${content(item.number)}</span>` : ''}${item.funding ? `<span>${content(item.funding)}</span>` : ''}${item.role ? `<span>${content(item.role)}</span>` : ''}</div></div></li>`).join('')}</ol>` : empty();
  document.getElementById('page-grants').innerHTML = header('Grants & awards', '基金项目与奖励') +
    note('grants', 'CV 中未注明你在 NSFC 123B2008 项目中的主持或参与身份，可在确认后补充。') +
    section('Research grants', '科研项目', projects) + (d.grants.awards.length ? section('Honors & awards', '荣誉奖励', timeline(d.grants.awards)) : '');

  const courses = items => items.length ? `<ul class="course-list">${items.map(item => `<li><div class="course-term">${content(item.term)}</div><div><h3>${content(item.title)}</h3><p class="course-meta">${content(item.role)} · ${content(item.institution)}</p>${item.description ? `<p class="course-description">${content(item.description)}</p>` : ''}<div class="paper-links">${safeUrl(item.url, true) ? external('Course page ↗', item.url) : ''}${safeUrl(item.notes, true) ? external('Lecture notes ↗', item.notes) : ''}</div></div></li>`).join('')}</ul>` : empty();
  document.getElementById('page-teaching').innerHTML = header('Teaching', '教学', 'Courses & teaching materials') +
    note('teaching', '可补充课程网页或讲义链接。') +
    (d.teaching.current.length ? section('Current teaching', '当前课程', courses(d.teaching.current)) : '') + (d.teaching.past.length ? section('Teaching experience', '教学经历', courses(d.teaching.past)) : '');

  document.getElementById('page-contact').innerHTML = header('Contact', '联系方式') +
    `<div class="contact-grid"><section><h2>Email <span class="zh-label">邮箱</span></h2><p>${emailHtml}</p></section>${d.contact.office ? `<section><h2>Office <span class="zh-label">办公室</span></h2><p>${content(d.contact.office)}</p></section>` : ''}<section class="contact-full"><h2>Postal address <span class="zh-label">通讯地址</span></h2><p>${content(p.department)}<br>${content(p.institution)}<br>${content(d.contact.address)}${d.contact.postalCode ? `<br>${content(d.contact.postalCode)}` : ''}</p></section>${usableLinks.length ? `<section class="contact-full"><h2>Academic profiles <span class="zh-label">学术链接</span></h2><div class="contact-links">${usableLinks.map(link => safeUrl(link.url) ? external(link.label + ' ↗', link.url) : missing(link.label)).join('')}</div></section>` : ''}</div>` +
    note('contact / profile', '可补充办公室房间号、邮编和个人学术主页链接。');

  const pages = { about:'About', cv:'Résumé', research:'Research', grants:'Grants', teaching:'Teaching', contact:'Contact' };
  const enabled = Object.keys(pages).filter(routeEnabled);
  if (!enabled.length) enabled.push('about');
  document.querySelectorAll('.primary-nav a').forEach(a => { a.hidden = !enabled.includes(a.dataset.page); });
  document.querySelector('.site-title').href = '#' + enabled[0];
  function navigate(focus = false) {
    let key = location.hash.slice(1);
    if (key === 'main') return;
    if (!enabled.includes(key)) key = enabled[0];
    for (const id of Object.keys(pages)) document.getElementById('page-' + id).hidden = id !== key;
    document.querySelectorAll('.primary-nav a').forEach(a => {
      if (a.dataset.page === key) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    document.title = `${pages[key]} | ${p.nameEn}`;
    if (focus) {
      document.getElementById('main').focus({ preventScroll: true });
      if (window.matchMedia('(max-width: 780px)').matches) document.getElementById('main').scrollIntoView({block:'start', behavior:'auto'});
      else window.scrollTo({ top:0, behavior:'auto' });
    }
  }
  window.addEventListener('hashchange', () => navigate(true));
  navigate();
  document.getElementById('hint-toggle').addEventListener('click', event => {
    const hidden = document.body.classList.toggle('hints-hidden');
    event.currentTarget.setAttribute('aria-pressed', String(!hidden));
    event.currentTarget.textContent = hidden ? '显示填写提示' : '隐藏填写提示';
  });
  document.getElementById('guide-toggle').addEventListener('click', event => {
    const panel = document.getElementById('filling-guide');
    panel.hidden = !panel.hidden;
    event.currentTarget.setAttribute('aria-expanded', String(!panel.hidden));
    event.currentTarget.innerHTML = panel.hidden ? '填写清单 <span aria-hidden="true">↗</span>' : '收起清单 <span aria-hidden="true">↑</span>';
  });
})();
