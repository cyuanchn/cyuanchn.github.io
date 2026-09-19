(() => {
  'use strict';

  const d = window.PROFILE;
  if (!d) return;

  const p = d.profile;

  const esc = value =>
    String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));

  const safeUrl = (value, local = false) => {
    const url = String(value || '').trim();

    if (/^https?:\/\//i.test(url)) {
      return esc(url);
    }

    if (
      local &&
      /^(?:\.\/)?assets\/[\w./%+@() -]+$/i.test(url) &&
      !url.includes('..')
    ) {
      return esc(url);
    }

    return '';
  };

  const external = (label, url) => {
    const href = safeUrl(url, true);

    return href
      ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`
      : esc(label);
  };

  const header = (title, subtitle = '') =>
    `<header class="page-header">
      <h1>${esc(title)}</h1>
      ${subtitle ? `<p class="subtitle">${esc(subtitle)}</p>` : ''}
    </header>`;

  const section = (title, body) =>
    `<section class="content-section">
      <h2>${esc(title)}</h2>
      ${body}
    </section>`;

  const empty = () =>
    '<p class="empty-section">No entries yet.</p>';

  const arrow = '<span aria-hidden="true">→</span>';

  const icons = {
    pin:
      '<path d="M13.5 6.5c0 4-5.5 8-5.5 8s-5.5-4-5.5-8a5.5 5.5 0 0 1 11 0Z"/><circle cx="8" cy="6.5" r="1.7"/>',

    mail:
      '<rect x="1.5" y="3" width="13" height="10" rx="1"/><path d="m2 4 6 4.5L14 4"/>',

    link:
      '<path d="m6.5 9.5 3-3M5 6 3.5 7.5a3.5 3.5 0 0 0 5 5L10 11M6 5l1.5-1.5a3.5 3.5 0 0 1 5 5L11 10"/>',

    school:
      '<path d="m1 5 7-3 7 3-7 3-7-3Zm3 2v4c2.5 2 5.5 2 8 0V7M14 6v6"/>'
  };

  const icon = name =>
    `<svg viewBox="0 0 16 16" aria-hidden="true">
      ${icons[name] || icons.link}
    </svg>`;

  const email = String(p.email || '').trim();

  const emailValid =
    /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email);

  const emailHtml = emailValid
    ? `<a href="mailto:${esc(encodeURI(email))}">${esc(email)}</a>`
    : '';

  const usableLinks = p.links.filter(link => safeUrl(link.url));

  const socialLinks = usableLinks.map(link =>
    `<li>
      ${icon(link.label === 'Google Scholar' ? 'school' : 'link')}
      ${external(link.label, link.url)}
    </li>`
  ).join('');

  const photo = safeUrl(p.photo, true);
  const photoFallback = '<span class="photo-word">PHOTO</span>';

  document.getElementById('profile').innerHTML = `
    <div class="portrait">
      ${
        photo
          ? `<img
               id="portrait-image"
               src="${photo}"
               alt="Portrait of ${esc(p.nameEn)}"
               width="600"
               height="600">`
          : photoFallback
      }
    </div>

    <div class="profile-summary">
      <h2 class="profile-name">
        ${esc(p.nameEn)}
        ${
          p.nameZh
            ? `<span class="profile-name-zh" lang="zh-CN">${esc(p.nameZh)}</span>`
            : ''
        }
      </h2>

      <p class="profile-position">${esc(p.position)}</p>

      <p class="profile-institution">
        ${esc(p.department)}<br>
        ${external(p.institution, p.institutionUrl)}
      </p>

      <p class="profile-keywords">${esc(p.researchKeywords)}</p>
    </div>

    <ul class="profile-links">
      <li>${icon('pin')}${esc(p.city)}</li>
      ${emailHtml ? `<li>${icon('mail')}${emailHtml}</li>` : ''}
      ${socialLinks}
    </ul>
  `;

  const portraitImage = document.getElementById('portrait-image');

  if (portraitImage) {
    portraitImage.addEventListener('error', () => {
      portraitImage.parentElement.innerHTML = photoFallback;
    });
  }

  document.getElementById('site-name').textContent = p.nameEn;

  document.querySelector('meta[name="description"]').content =
    d.site.description;

  document.getElementById('copyright').textContent =
    `© ${new Date().getFullYear()} ${p.nameEn}`;

  document.getElementById('last-updated').textContent =
    d.site.lastUpdated ? `Updated ${d.site.lastUpdated}` : '';

  const interests = () =>
    `<ol class="research-list">
      ${
        d.research.interests.map((item, i) =>
          `<li>
            <span class="list-index" aria-hidden="true">
              ${String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <h3>${esc(item.title)}</h3>
              <p>${esc(item.description)}</p>
            </div>
          </li>`
        ).join('')
      }
    </ol>`;

  const routeEnabled = key => d.site.sections[key] !== false;

  // Personal photographs.
  const photos = (d.about.photos || [])
    .filter(item => safeUrl(item.src, true));

  const gallery = photos.length
    ? section(
        'Beyond mathematics',
        `<div class="life-photos">
          ${
            photos.map(item => {
              const src = safeUrl(item.src, true);

              const alt =
                item.alt || `Personal photograph of ${p.nameEn}`;

              const dimensions =
                Number.isInteger(item.width) &&
                item.width > 0 &&
                Number.isInteger(item.height) &&
                item.height > 0
                  ? ` width="${item.width}" height="${item.height}"`
                  : '';

              return `
                <figure class="life-photo">
                  <a
                    href="${src}"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="${esc(alt)} — view full-size photo">
                    <img
                      src="${src}"
                      alt="${esc(alt)}"
                      ${dimensions}
                      loading="lazy"
                      decoding="async">
                  </a>
                  ${
                    item.caption
                      ? `<figcaption>${esc(item.caption)}</figcaption>`
                      : ''
                  }
                </figure>
              `;
            }).join('')
          }
        </div>`
      )
    : '';

  document.getElementById('page-about').innerHTML =
    header('About me') +
    `<div class="biography">
      ${d.about.paragraphs.map(text => `<p>${esc(text)}</p>`).join('')}
    </div>` +
    '<hr class="divider">' +
    section(
      'Research interests',
      `<p>${esc(d.about.researchSummary)}</p>${interests()}`
    ) +
    gallery +
    `<div class="home-links">
      ${
        routeEnabled('research')
          ? `<a class="section-link" href="#research">
               Research & publications ${arrow}
             </a>`
          : ''
      }
      ${
        routeEnabled('cv')
          ? `<a class="section-link" href="#cv">
               Curriculum vitae ${arrow}
             </a>`
          : ''
      }
    </div>`;

  const pdf = (label, filePath) => {
    const href = safeUrl(filePath, true);

    return href
      ? `<a
           class="pdf-button"
           href="${href}"
           target="_blank"
           rel="noopener noreferrer">
           ${esc(label)} <span aria-hidden="true">↗</span>
         </a>`
      : '';
  };

  const timeline = (items, titleTag = 'h3') =>
    items.length
      ? `<ol class="timeline">
          ${
            items.map(item =>
              `<li${item.period ? '' : ' class="undated"'}>
                ${
                  item.period
                    ? `<div class="period">${esc(item.period)}</div>`
                    : ''
                }
                <div>
                  <${titleTag}>${esc(item.title)}</${titleTag}>
                  <p>${external(item.institution, item.url)}</p>
                  ${
                    item.detail
                      ? `<p class="detail">${esc(item.detail)}</p>`
                      : ''
                  }
                  ${
                    (item.details || []).map(text =>
                      `<p class="detail">${esc(text)}</p>`
                    ).join('')
                  }
                </div>
              </li>`
            ).join('')
          }
        </ol>`
      : empty();

  const groupedExperience = items => {
    const categories = [
      ...new Set(items.map(item => item.category || ''))
    ];

    if (categories.length === 1 && !categories[0]) {
      return timeline(items);
    }

    return categories.map(category =>
      `<section class="experience-group">
        ${
          category
            ? `<h3 class="experience-group-title">${esc(category)}</h3>`
            : ''
        }
        ${
          timeline(
            items.filter(item => (item.category || '') === category),
            'h4'
          )
        }
      </section>`
    ).join('');
  };

  const cvLinks =
    pdf('CV · English', d.cv.englishPdf) +
    pdf('CV · Chinese', d.cv.chinesePdf);

  document.getElementById('page-cv').innerHTML =
    header('Curriculum vitae', 'Education & academic experience') +
    (cvLinks ? `<div class="download-row">${cvLinks}</div>` : '') +
    (
      d.cv.positions.length
        ? section('Appointments', timeline(d.cv.positions))
        : ''
    ) +
    section('Education', timeline(d.cv.education)) +
    (
      d.cv.academicExperience?.length
        ? section(
            'Academic experience',
            groupedExperience(d.cv.academicExperience)
          )
        : ''
    ) +
    (
      d.cv.languages?.length
        ? section(
            'Languages',
            `<ul class="list-simple">
              ${d.cv.languages.map(text => `<li>${esc(text)}</li>`).join('')}
            </ul>`
          )
        : ''
    );

  // Optional descriptions beneath publications and preprints.
  const papers = items =>
    items.length
      ? `<ol class="paper-list">
          ${
            items.map(item => {
              const links = [
                ['DOI', item.doi],
                ['arXiv', item.arxiv],
                ['PDF', item.pdf]
              ].filter(([, url]) => safeUrl(url, true));

              const summary = String(item.summary ?? '').trim();

              return `
                <li class="paper">
                  <h3 class="paper-title">${esc(item.title)}</h3>

                  <p class="paper-authors">${esc(item.authors)}</p>

                  <p class="paper-venue">
                    <i>${esc(item.venue)}</i>
                    ${item.year ? ` · ${esc(item.year)}` : ''}
                  </p>

                  ${
                    summary
                      ? `<p class="paper-summary">${esc(summary)}</p>`
                      : ''
                  }

                  ${
                    links.length
                      ? `<div class="paper-links">
                          ${
                            links.map(([label, url]) =>
                              external(label, url)
                            ).join('')
                          }
                        </div>`
                      : ''
                  }
                </li>
              `;
            }).join('')
          }
        </ol>`
      : empty();

  const talks = d.research.talks.length
    ? `<ol class="timeline">
        ${
          d.research.talks.map(item =>
            `<li>
              <div class="period">${esc(item.date)}</div>
              <div>
                <h3>${external(item.title, item.url)}</h3>
                <p class="detail">${esc(item.venue)}</p>
                ${
                  item.role
                    ? `<p class="activity-role">${esc(item.role)}</p>`
                    : ''
                }
              </div>
            </li>`
          ).join('')
        }
      </ol>`
    : '';

  document.getElementById('page-research').innerHTML =
    header('Research', 'Interests, publications & academic activities') +
    section(
      'Research interests',
      interests() +
      (
        d.research.statementPdf
          ? `<div class="download-row">
               ${pdf('Research statement', d.research.statementPdf)}
             </div>`
          : ''
      )
    ) +
    section('Publications', papers(d.research.publications)) +
    section('Preprints', papers(d.research.preprints)) +
    (
      talks
        ? section('Conferences & seminars', talks)
        : ''
    ) +
    (
      d.research.service.length
        ? section(
            'Academic service',
            `<ul class="list-simple">
              ${
                d.research.service.map(text =>
                  `<li>${esc(text).replace(
                    /\bCMC\b/g,
                    external('CMC', 'http://www.cmathc.cn/')
                  )}</li>`
                ).join('')
              }
            </ul>`
          )
        : ''
    );

  const projects = d.grants.projects.length
    ? `<ol class="timeline">
        ${
          d.grants.projects.map(item =>
            `<li>
              <div class="period">
                ${esc(item.period)}
                ${
                  item.status
                    ? `<br><span class="grant-status">${esc(item.status)}</span>`
                    : ''
                }
              </div>

              <div>
                <h3>${esc(item.title)}</h3>
                <p>${esc(item.agency)}</p>

                <div class="grant-meta">
                  ${
                    item.number
                      ? `<span>Grant No. ${esc(item.number)}</span>`
                      : ''
                  }
                  ${
                    item.funding
                      ? `<span>${esc(item.funding)}</span>`
                      : ''
                  }
                  ${
                    item.role
                      ? `<span>${esc(item.role)}</span>`
                      : ''
                  }
                </div>
              </div>
            </li>`
          ).join('')
        }
      </ol>`
    : empty();

  document.getElementById('page-grants').innerHTML =
    header('Grants & awards') +
    section('Research grants', projects) +
    (
      d.grants.awards.length
        ? section('Honors & awards', timeline(d.grants.awards))
        : ''
    );

  const courses = items =>
    items.length
      ? `<ul class="course-list">
          ${
            items.map(item =>
              `<li>
                <div class="course-term">${esc(item.term)}</div>

                <div>
                  <h3>${esc(item.title)}</h3>

                  <p class="course-meta">
                    ${esc(item.role)} · ${esc(item.institution)}
                  </p>

                  ${
                    item.description
                      ? `<p class="course-description">${esc(item.description)}</p>`
                      : ''
                  }

                  <div class="paper-links">
                    ${
                      safeUrl(item.url, true)
                        ? external('Course page ↗', item.url)
                        : ''
                    }
                    ${
                      safeUrl(item.notes, true)
                        ? external('Lecture notes ↗', item.notes)
                        : ''
                    }
                  </div>
                </div>
              </li>`
            ).join('')
          }
        </ul>`
      : empty();

  document.getElementById('page-teaching').innerHTML =
    header('Teaching', 'Courses & teaching materials') +
    (
      d.teaching.current.length
        ? section('Current teaching', courses(d.teaching.current))
        : ''
    ) +
    (
      d.teaching.past.length
        ? section('Teaching experience', courses(d.teaching.past))
        : ''
    );

  document.getElementById('page-contact').innerHTML =
    header('Contact') +
    `<div class="contact-grid">
      ${
        emailHtml
          ? `<section>
               <h2>Email</h2>
               <p>${emailHtml}</p>
             </section>`
          : ''
      }

      ${
        d.contact.office
          ? `<section>
               <h2>Office</h2>
               <p>${esc(d.contact.office)}</p>
             </section>`
          : ''
      }

      <section class="contact-full">
        <h2>Postal address</h2>
        <p>
          ${esc(p.department)}<br>
          ${esc(p.institution)}<br>
          ${esc(d.contact.address)}
          ${
            d.contact.postalCode
              ? `<br>${esc(d.contact.postalCode)}`
              : ''
          }
        </p>
      </section>

      ${
        usableLinks.length
          ? `<section class="contact-full">
               <h2>Academic profiles</h2>
               <div class="contact-links">
                 ${
                   usableLinks.map(link =>
                     external(link.label + ' ↗', link.url)
                   ).join('')
                 }
               </div>
             </section>`
          : ''
      }
    </div>`;

  const pages = {
    about: 'About',
    cv: 'Résumé',
    research: 'Research',
    grants: 'Grants',
    teaching: 'Teaching',
    contact: 'Contact'
  };

  const enabled = Object.keys(pages).filter(routeEnabled);

  if (!enabled.length) {
    enabled.push('about');
  }

  document.querySelectorAll('.primary-nav a').forEach(a => {
    a.hidden = !enabled.includes(a.dataset.page);
  });

  document.querySelector('.site-title').href = '#' + enabled[0];

  function navigate(focus = false) {
    let key = location.hash.slice(1);

    if (key === 'main') return;

    if (!enabled.includes(key)) {
      key = enabled[0];
    }

    for (const id of Object.keys(pages)) {
      document.getElementById('page-' + id).hidden = id !== key;
    }

    document.querySelectorAll('.primary-nav a').forEach(a => {
      if (a.dataset.page === key) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    });

    document.title = `${pages[key]} | ${p.nameEn}`;

    if (focus) {
      document.getElementById('main').focus({
        preventScroll: true
      });

      if (window.matchMedia('(max-width: 780px)').matches) {
        document.getElementById('main').scrollIntoView({
          block: 'start',
          behavior: 'auto'
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'auto'
        });
      }
    }
  }

  window.addEventListener('hashchange', () => navigate(true));

  navigate();
})();
