const STYLESHEET = `
* {
	box-sizing: border-box;
}

body,
html {
	margin: 0;
	padding: 0;
	width: 100%;
	min-height: 100%;
}

body {
	padding: 2vh;
	/* Responsive base font size: never smaller than 15px, scales with viewport height */
	font-size: clamp(15px, 2.2vh, 22px);
}

html {
	background: linear-gradient(135deg, #3d1f5c 0%, #2d1544 50%, #1a0d2e 100%);
	background-attachment: fixed;
	min-height: 100vh;
	animation: gradientShift 8s ease-in-out infinite;
}

@keyframes gradientShift {
	0%, 100% { background-position: 0% 50%; }
	50% { background-position: 100% 50%; }
}

body {
	/* Use a single-column flex layout to avoid unintended side-by-side columns */
	display: flex;
	flex-direction: column;
	align-items: center;
	font-family: 'Open Sans', Arial, sans-serif;
	color: white;
}

h1 {
	font-size: clamp(28px, 5vh, 54px);
	font-weight: 700;
}

h2 {
	font-size: clamp(17px, 2.6vh, 30px);
	font-weight: normal;
	font-style: italic;
	opacity: 0.8;
}

h3 {
	font-size: clamp(17px, 2.6vh, 30px);
}

h1,
h2,
h3,
p {
	margin: 0;
	text-shadow: 0 0 1vh rgba(0, 0, 0, 0.15);
}

p {
	font-size: clamp(14px, 2vh, 22px);
}

ul {
	font-size: clamp(14px, 2vh, 22px);
	margin: 0;
	margin-top: 1vh;
	padding-left: 3vh;
}

a {
	color: white
}

a.install-link {
	text-decoration: none
}

button {
	border: 0;
	outline: 0;
	color: white;
	background: #8A5AAB;
	padding: 1.2vh 3.5vh;
	margin: auto; text-align: center; font-family: 'Open Sans', Arial, sans-serif; font-size: clamp(16px, 2.4vh, 26px); font-weight: 600; cursor: pointer; display: block; box-shadow: 0 0.5vh 1vh rgba(0, 0, 0, 0.2); transition: box-shadow 0.1s ease-in-out; }

button:hover {
	box-shadow: none;
}

button:active {
	box-shadow: 0 0 0 0.5vh white inset;
}

/* Input Styles Override */
input[type="text"], input[type="number"], input[type="password"] {
	border: 1px solid rgba(140, 82, 255, 0.4) !important;
	box-shadow: none !important;
	background: rgba(0, 0, 0, 0.3) !important;
	color: #fff !important;
	outline: none !important;
	transition: border 0.3s, box-shadow 0.3s;
}
input[type="text"]:focus, input[type="number"]:focus, input[type="password"]:focus {
	border: 1px solid rgba(140, 82, 255, 0.8) !important;
	box-shadow: 0 0 8px rgba(140, 82, 255, 0.3) !important;
}

/* Pretty toggle styles */
.toggle-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 0.6rem;
	padding: 0.45rem 0.25rem;
	border-radius: 10px;
}
.toggle-title {
	font-size: clamp(0.95rem, 2.1vh, 1.35rem);
	font-weight: 700;
	letter-spacing: 0.01em;
	color: #c9b3ff; /* soft purple */
	text-shadow: 0 0 8px rgba(140, 82, 255, 0.6);
}
.toggle-right {
	display: inline-flex;
	align-items: center;
	gap: 0.4rem;
}
.toggle-off, .toggle-on {
	font-size: clamp(0.75rem, 1.8vh, 1rem);
	font-weight: 700;
	letter-spacing: 0.03em;
}
.toggle-off { color: #888; }
.toggle-on { color: #888; }
.toggle-row.is-on .toggle-on { color: #00c16e; }
.toggle-row:not(.is-on) .toggle-off { color: #ff3b3b; }

/* Switch */
.switch {
	position: relative;
	display: inline-block;
	width: 62px;
	height: 30px;
}
.switch input { display: none; }
.slider {
	position: absolute;
	cursor: pointer;
	top: 0; left: 0; right: 0; bottom: 0;
	background-color: #b31b1b; /* red when OFF */
	transition: 0.2s ease;
	border-radius: 30px;
	box-shadow: 0 0 10px rgba(140, 82, 255, 0.5); /* purple glow */
}
.slider:before {
	position: absolute;
	content: "";
	height: 24px;
	width: 24px;
	left: 3px;
	top: 3px;
	background-color: #fff;
	border-radius: 50%;
	transition: 0.2s ease;
}

.switch input:checked + .slider {
	background-color: #00c16e; /* green when ON */
	box-shadow: 0 0 14px rgba(140, 82, 255, 0.9); /* stronger glow */
}
.switch input:checked + .slider:before { transform: translateX(32px); }

#addon {
	/* Make the main container responsive and single-column */
	width: 100%;
	max-width: 1100px;
	margin: auto;
}

.logo {
	height: 14vh;
	width: 14vh;
	margin: auto;
	margin-bottom: 3vh;
}

.logo img {
	width: 100%;
}

.name, .version {
	display: block;
	text-align: center;
	vertical-align: top;
}

.name {
	line-height: 5vh;
	margin: 0;
}

.version {
	position: relative;
	line-height: 5vh;
	opacity: 0.8;
	margin-bottom: 2vh;
}

.description {
	text-align: center;
	margin-bottom: 2vh;
}

.contact {
	position: absolute;
	left: 0;
	bottom: 4vh;
	width: 100%;
	text-align: center;
}

.contact a {
	font-size: 1.4vh;
	font-style: italic;
}

.separator {
	margin-bottom: 4vh;
}

.form-element {
	margin-bottom: 2vh;
}

.label-to-top {
	margin-bottom: 2vh;
}

.full-width {
	width: 100%;
}

/* Actions row: install + copy side by side */
.actions-row {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 1rem;
	flex-wrap: wrap;
	margin-top: 2rem;
}
.actions-row .install-link button,
.actions-row #copyManifestLink {
	margin: 0; /* override global button margin */
}
.actions-row .install-link button {
	padding: 0.85rem 2.2rem;
	background: linear-gradient(135deg, #7c3aff, #a855f7);
	color: #fff;
	border: 2px solid #c084fc;
	border-radius: 10px;
	cursor: pointer;
	font-weight: 800;
	font-size: 1.05rem;
	letter-spacing: 0.05em;
	box-shadow: 0 0 18px rgba(168,85,247,0.9), 0 0 40px rgba(168,85,247,0.45), inset 0 1px 0 rgba(255,255,255,0.15);
	text-shadow: 0 0 8px rgba(255,255,255,0.6);
	transition: all 0.2s ease;
}
.actions-row #copyManifestLink {
	padding: 0.85rem 2.2rem;
	background: linear-gradient(135deg, #1e3a8a, #2563eb);
	color: #fff;
	border: 2px solid #60a5fa;
	border-radius: 10px;
	cursor: pointer;
	font-weight: 800;
	font-size: 1.05rem;
	letter-spacing: 0.05em;
	box-shadow: 0 0 18px rgba(96,165,250,0.9), 0 0 40px rgba(96,165,250,0.45), inset 0 1px 0 rgba(255,255,255,0.15);
	text-shadow: 0 0 8px rgba(255,255,255,0.6);
	transition: all 0.2s ease;
}

/* Preset buttons */
.preset-btn { background:#4d2d66; border:1px solid #8c52ff; color:#fff; font-weight:600; padding:0.45rem 0.6rem; border-radius:8px; cursor:pointer; box-shadow:0 0 8px rgba(140,82,255,0.4); transition:background .2s, transform .15s; }
.preset-btn:hover { background:#5c3780; }
.preset-btn:active { transform:scale(.95); }
.preset-btn.active { background:#00c16e; border-color:#00c16e; box-shadow:0 0 10px rgba(0,193,110,0.7); }
`

function landingTemplate(manifest: any) {
	const logo = manifest.logo || 'https://dl.strem.io/addon-logo.png'
	const favicon = manifest.favicon || logo
	const contactHTML = manifest.contactEmail ?
		`<div class="contact">
			<p>Contact ${manifest.name} creator:</p>
			<a href="mailto:${manifest.contactEmail}">${manifest.contactEmail}</a>
		</div>` : ''

	const stylizedTypes = manifest.types
		.map((t: string) => t[0].toUpperCase() + t.slice(1) + (t !== 'series' ? 's' : ''))

	let formHTML = ''
	let script = ''

	// ── GUIDED INSTALLATION SECTION ──
	const guidedInstallationHTML = `
		<div id="guidedInstallerSection" style="margin: 2rem 0; width: 100%; box-sizing: border-box; padding: 2rem; border-radius: 12px; background: rgba(20, 15, 35, 0.85); border: 1px solid rgba(140, 82, 255, 0.5);">
			<h3 style="text-align: center; margin-bottom: 1.5rem; font-size: 1.3rem; color: #c9b3ff; text-shadow: 0 0 8px rgba(140, 82, 255, 0.6);">
				Scegli la tua Configurazione
			</h3>
			
			<!-- Preset Grid -->
			<div id="presetGrid">
				<div style="margin-bottom: 1.5rem; padding: 1.2rem 1.2rem 0.8rem; border: 1px solid rgba(160, 160, 180, 0.25); border-radius: 10px; background: rgba(255,255,255,0.03);">
					<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 0.85rem;">
						<div class="preset-card" data-preset="film-serie" style="padding: 1rem; border: 2px solid rgba(140, 82, 255, 0.4); border-radius: 10px; background: rgba(45, 21, 68, 0.7); cursor: pointer; transition: all 0.3s ease;">
							<div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.4rem; color: #c9b3ff;">Film + Serie</div>
							<div style="font-size: 0.7rem; color: #888; line-height: 1.4;">StreamingCommunity, Guardaflix, Guardoserie</div>
						</div>
						<div class="preset-card" data-preset="film-serie-anime" style="padding: 1rem; border: 2px solid rgba(140, 82, 255, 0.4); border-radius: 10px; background: rgba(45, 21, 68, 0.7); cursor: pointer; transition: all 0.3s ease;">
							<div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.4rem; color: #c9b3ff;">Film + Serie + Anime</div>
							<div style="font-size: 0.7rem; color: #888; line-height: 1.4;">StreamingCommunity, Guardaflix, Guardoserie, AnimeSaturn, AnimeWorld, AnimeUnity</div>
						</div>
					</div>
				</div>
			</div>
			
			<!-- Preset Details Panel -->
			<div id="presetDetailsPanel" style="display: none; background: rgba(10, 10, 25, 0.9); padding: 1.5rem; border-radius: 10px; border: 1px solid rgba(140, 82, 255, 0.6); margin-bottom: 1.5rem;">
				<h4 id="presetName" style="color: #c9b3ff; margin-bottom: 1rem; font-size: 1.1rem;"></h4>
				<div id="presetProviders" style="color: #aaa; font-size: 0.85rem; line-height: 1.8; margin-bottom: 1rem;"></div>
				
				<div style="margin-bottom: 1.5rem; text-align: left;">
					<label for="presetTmdbKey" style="display: block; font-size: 0.9rem; color: #c9b3ff; margin-bottom: 0.5rem; font-weight: 600;">TMDB API Key (Opzionale, ma consigliata)</label>
					<input type="text" id="presetTmdbKey" placeholder="Inserisci la tua TMDB API Key" style="width: 100%; padding: 0.7rem; border-radius: 6px; border: 1px solid rgba(140, 82, 255, 0.4); background: rgba(0, 0, 0, 0.3); color: #fff; outline: none; font-family: inherit; box-shadow: none;">
					<p style="font-size: 0.75rem; color: #888; margin-top: 0.4rem;">Lascia vuoto per usare quella di default.</p>
				</div>

				<div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
					<button id="confirmPresetBtn" type="button" style="padding: 0.7rem 1.5rem; background: #00c16e; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s ease;">
						Continua con questo Preset
					</button>
					<button id="cancelPresetBtn" type="button" style="padding: 0.7rem 1.5rem; background: rgba(140, 82, 255, 0.4); color: #fff; border: 1px solid rgba(140, 82, 255, 0.6); border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s ease;">
						Indietro
					</button>
				</div>
			</div>
			
			<div style="text-align: center; margin-top: 0.5rem;">
				<p style="font-size: 0.8rem; color: #aaa; margin-bottom: 0.75rem;">Oppure configura manualmente con la modalità personalizzata</p>
				<button id="switchToCustomBtn" type="button" style="display: inline-block; padding: 0.75rem 2rem; background: linear-gradient(135deg, rgba(140,82,255,0.25), rgba(100,50,200,0.35)); color: #e0ccff; border: 1.5px solid rgba(180,130,255,0.7); border-radius: 30px; cursor: pointer; font-weight: 700; font-size: 0.95rem; letter-spacing: 0.03em; box-shadow: 0 0 14px rgba(140,82,255,0.45), 0 0 30px rgba(140,82,255,0.2); transition: all 0.25s ease;">
					➜ Passa a Installazione Personalizzata
				</button>
			</div>
		</div>
	`;

	if ((manifest.config || []).length) {
		let options = ''
		manifest.config.forEach((elem: any) => {
			const key = elem.key
			if (["text", "number", "password"].includes(elem.type)) {
				const isRequired = elem.required ? ' required' : ''
				const defaultHTML = elem.default ? ` value="${elem.default}"` : ''
				const inputType = elem.type
				options += `
					<div style="margin-bottom: 1.5rem; text-align: left;">
						<label for="${key}" style="display: block; font-size: 0.9rem; color: #c9b3ff; margin-bottom: 0.5rem; font-weight: 600;">${elem.title}</label>
						<input type="${inputType}" id="${key}" name="${key}" placeholder="Inserisci ${elem.title}" style="width: 100%; padding: 0.7rem; border-radius: 6px; border: 1px solid rgba(140, 82, 255, 0.4); background: rgba(0, 0, 0, 0.3); color: #fff; outline: none; font-family: inherit; box-shadow: none;"${defaultHTML}${isRequired}/>
						${key === 'tmdbApiKey' ? '<p style="font-size: 0.75rem; color: #888; margin-top: 0.4rem;">Lascia vuoto per usare quella di default.</p>' : ''}
					</div>
					`
			} else if (elem.type === 'checkbox') {
				// Custom pretty toggle for known keys
				const toggleMap: any = {
					'disableVixsrc': { title: 'StreamingCommunity', invert: true },
					'vixDirectFhd': { title: 'StreamingCommunity FHD', invert: false, description: "Aggiunge un'opzione aggiuntiva a quella standard che forza la qualità 1080p." },
					'animeunityEnabled': { title: 'AnimeUnity', invert: false },
					'animesaturnEnabled': { title: 'AnimeSaturn', invert: false },
					'animeworldEnabled': { title: 'AnimeWorld', invert: false },
					'guardoserieEnabled': { title: 'GuardoSerie', invert: false },
					'guardaflixEnabled': { title: 'Guardaflix', invert: false },
				}
				if (toggleMap[key]) {
					const t = toggleMap[key];
					const hasDefault = (typeof (elem as any).default === 'boolean');
					const isChecked = hasDefault ? (t.invert ? !((elem as any).default as boolean) : !!(elem as any).default) : true;
					const checkedAttr = isChecked ? ' checked' : '';
					
					options += `
							<div class="form-element">
								<div class="toggle-row" data-toggle-row="${key}">
									<span class="toggle-title">${t.title}</span>
									<div class="toggle-right">
										<span class="toggle-off">OFF</span>
										<label class="switch">
											<input type="checkbox" id="${key}" name="${key}" data-config-key="${key}" data-main-toggle="1" data-invert="${t.invert ? 'true' : 'false'}"${checkedAttr} />
											<span class="slider"></span>
										</label>
										<span class="toggle-on">ON</span>
									</div>
								</div>
								${t.description ? '<div style="font-size: 0.75rem; color: #888; margin-top: 0.2rem; padding: 0 0.25rem;">' + t.description + '</div>' : ''}
							</div>
							`
				} else {
					const isChecked = (typeof (elem as any).default === 'boolean')
						? (((elem as any).default as boolean) ? ' checked' : '')
						: (elem.default === 'checked' ? ' checked' : '')
					options += `
						<div class="form-element">
							<label for="${key}">
								<input type="checkbox" id="${key}" name="${key}"${isChecked}> <span class="label-to-right">${elem.title}</span>
							</label>
						</div>
						`
				}
			} else if (elem.type === 'select') {
				const defaultValue = elem.default || (elem.options || [])[0]
				options += `<div class="form-element">
				<div class="label-to-top">${elem.title}</div>
				<select id="${key}" name="${key}" class="full-width">
				`
				const selections = elem.options || []
				selections.forEach((el: string) => {
					const isSelected = el === defaultValue ? ' selected' : ''
					options += `<option value="${el}"${isSelected}>${el}</option>`
				})
				options += `</select>
               </div>
               `
			}
		})
		if (options.length) {
			formHTML = `
			<form id="mainForm">
				${options}
			</form>
			<div class="separator"></div>
			`
			script += `
			console.log('[SVX] Custom form logic init');
			var installLink = document.getElementById('installLink');
			var mainForm = document.getElementById('mainForm');
			if (installLink && mainForm) {
				try { window.__SVX_OK = true; } catch(e) {}
				installLink.onclick = function () { return (mainForm && typeof mainForm.reportValidity === 'function') ? mainForm.reportValidity() : true; };
				var buildConfigFromForm = function() {
					var config = {};
					var elements = (mainForm).querySelectorAll('input, select, textarea');
					elements.forEach(function(el) {
						var key = el.id || el.getAttribute('name') || '';
						if (!key) return;
						if (el.type === 'checkbox') {
							var cfgKey = el.getAttribute('data-config-key') || key;
							var invert = el.getAttribute('data-invert') === 'true';
							var val = !!el.checked;
							config[cfgKey] = invert ? !val : val;
						} else {
							config[key] = el.value.trim();
						}
					});
					return config;
				};
				try { window.buildConfigFromForm = buildConfigFromForm; } catch(e){}
				var updateLink = function() {
					var config = buildConfigFromForm();
					var configStr = JSON.stringify(config);
					var encodedConfig = btoa(configStr);
					installLink.setAttribute('href', 'stremio://' + window.location.host + '/' + encodedConfig + '/manifest.json');
				};
				(mainForm).onchange = updateLink;
				var toggleRows = (mainForm).querySelectorAll('[data-toggle-row]');
				var setRowState = function(row){
					if (!row) return;
					var input = row.querySelector('input[type="checkbox"][data-main-toggle="1"]');
					if (!input) return;
					if (input.checked) { row.classList.add('is-on'); } else { row.classList.remove('is-on'); }
				};
				toggleRows.forEach(function(row){
					setRowState(row);
					var input = row.querySelector('input[type="checkbox"][data-main-toggle="1"]');
					if (input) input.addEventListener('change', function(){ setRowState(row); });
				});
				window.updateLink = updateLink;
			}
			`
		}
	}

	script += `
		console.log('[SVX] Copy manifest setup');
		var copyManifestLink = document.getElementById('copyManifestLink');
		if (copyManifestLink) {
			copyManifestLink.onclick = function () {
				var manifestUrl;
				var mainForm = document.getElementById('mainForm');
				if (mainForm) {
					var config = window.buildConfigFromForm ? window.buildConfigFromForm() : {};
					var configStr = JSON.stringify(config);
					var encodedConfig = btoa(configStr);
					manifestUrl = window.location.protocol + '//' + window.location.host + '/' + encodedConfig + '/manifest.json';
				} else {
					manifestUrl = window.location.protocol + '//' + window.location.host + '/manifest.json';
				}
				try {
					if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
						navigator.clipboard.writeText(manifestUrl).then(function(){
							copyManifestLink.textContent = 'COPIATO!';
							copyManifestLink.style.background = '#1f8b4c';
							copyManifestLink.style.boxShadow = '0 0 12px rgba(31, 139, 76, 0.8)';
							setTimeout(function(){
								copyManifestLink.textContent = 'COPIA MANIFEST URL';
								copyManifestLink.style.background = '#8A5AAB';
								copyManifestLink.style.boxShadow = '0 0.5vh 1vh rgba(0, 0, 0, 0.2)';
							}, 1600);
						});
					} else {
						throw new Error('Clipboard API non disponibile');
					}
				} catch (err) {
					console.error('Errore durante la copia: ', err);
					alert("Impossibile copiare l'URL. Copialo manualmente: " + manifestUrl);
				}
				return false;
			};
		}
	`;

	return `
	<!DOCTYPE html>
	<html>

	<head>
		<meta charset="utf-8">
		<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
		<meta http-equiv="Pragma" content="no-cache" />
		<meta http-equiv="Expires" content="0" />
		<title>${manifest.name} - Stremio Addon</title>
		<style>${STYLESHEET}</style>
		<link rel="shortcut icon" href="${favicon}" type="image/x-icon">
		<link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700&display=swap" rel="stylesheet">
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/purecss@2.1.0/build/pure-min.css" integrity="sha384-yHIFVG6ClnONEA5yB5DJXfW2/KC173DIQrYoZMEtBvGzmf0PKiGyNEqe9N6BNDBH" crossorigin="anonymous">
	</head>

	<body>
		<div id="addon">
			<div class="logo">
			<img src="${logo}">
			</div>
			<h1 class="name">${manifest.name}</h1>
			<h2 class="version">v${manifest.version || '0.0.0'}</h2>

			<div class="separator"></div>



			<!-- GUIDED INSTALLATION (default visible) -->
			${guidedInstallationHTML}

			<!-- CUSTOM INSTALLATION (default hidden) -->
			<div id="customInstallerSection" style="display: none; margin: 2rem 0; width: 100%; box-sizing: border-box; padding: 2rem; border-radius: 12px; background: rgba(20, 15, 35, 0.85); border: 1px solid rgba(140, 82, 255, 0.5);">
				<h3 style="text-align: center; margin-bottom: 1.5rem; font-size: 1.3rem; color: #c9b3ff; text-shadow: 0 0 8px rgba(140, 82, 255, 0.6);">🛠️ Configurazione Personalizzata</h3>

				<div style="text-align: center; margin-bottom: 2rem;">
					<button id="switchToGuidedBtn" type="button" style="display: inline-block; padding: 0.75rem 2rem; background: linear-gradient(135deg, rgba(140,82,255,0.25), rgba(100,50,200,0.35)); color: #e0ccff; border: 1.5px solid rgba(180,130,255,0.7); border-radius: 30px; cursor: pointer; font-weight: 700; font-size: 0.95rem; letter-spacing: 0.03em; box-shadow: 0 0 14px rgba(140,82,255,0.45), 0 0 30px rgba(140,82,255,0.2); transition: all 0.25s ease;">
						⬅ Torna a Installazione Guidata
					</button>
				</div>

				<div style="max-width: 860px; margin: 0 auto; padding: 1.5rem; border-radius: 10px; background: rgba(10, 8, 25, 0.7); border: 1px solid rgba(140, 82, 255, 0.3);">
					${formHTML}
				</div>

			<div class="actions-row">
				<a id="installLink" class="install-link" href="#">
					<button name="Install">INSTALLA SU STREMIO</button>
				</a>
				<button id="copyManifestLink">COPIA MANIFEST URL</button>
			</div>
			${contactHTML}
		</div>
		<script>
			${script}
			try {
				if (typeof window.updateLink === 'function') {
					window.updateLink();
				} else {
					var installLink = document.getElementById('installLink');
					if (installLink) installLink.setAttribute('href', 'stremio://' + window.location.host + '/manifest.json');
				}
			} catch (e) { /* no-op */ }

			// ── GUIDED / CUSTOM TOGGLE LOGIC ──
			(function(){
				var guidedSection = document.getElementById('guidedInstallerSection');
				var customSection = document.getElementById('customInstallerSection');
				var switchToCustomBtn = document.getElementById('switchToCustomBtn');
				var switchToGuidedBtn = document.getElementById('switchToGuidedBtn');
				var actionsRow = document.querySelector('.actions-row');

				function showGuided(){
					if(guidedSection) guidedSection.style.display='block';
					if(customSection) customSection.style.display='none';
					if(actionsRow) actionsRow.style.display='none';
				}
				function showCustom(){
					if(guidedSection) guidedSection.style.display='none';
					if(customSection) customSection.style.display='block';
					if(actionsRow) actionsRow.style.display='flex';
				}

				if(switchToCustomBtn) switchToCustomBtn.addEventListener('click', showCustom);
				if(switchToGuidedBtn) switchToGuidedBtn.addEventListener('click', showGuided);

				var _pp = window.location.pathname.split('/').filter(function(s){ return s.length > 0; });
				var _hasCfg = _pp.length >= 2 && _pp[_pp.length - 1] === 'configure' && _pp[_pp.length - 2].length > 10;
				if (_hasCfg) {
					showCustom();
				} else {
					showGuided();
				}

				// ── PRESET DEFINITIONS ──
				var presets = {
					'film-serie': {
						name: 'Film + Serie',
						providers: ['Guardaflix', 'StreamingCommunity', 'Guardoserie'],
						config: { disableVixsrc:false, guardoserieEnabled:true, guardaflixEnabled:true, animeunityEnabled:false, animesaturnEnabled:false, animeworldEnabled:false }
					},
					'film-serie-anime': {
						name: 'Film + Serie + Anime',
						providers: ['Guardaflix', 'StreamingCommunity', 'Guardoserie', 'AnimeSaturn', 'AnimeWorld', 'AnimeUnity'],
						config: { disableVixsrc:false, guardoserieEnabled:true, guardaflixEnabled:true, animeunityEnabled:true, animesaturnEnabled:true, animeworldEnabled:true }
					}
				};

				var presetCards = document.querySelectorAll('.preset-card');
				var detailsPanel = document.getElementById('presetDetailsPanel');
				var presetNameEl = document.getElementById('presetName');
				var presetProvidersEl = document.getElementById('presetProviders');
				var confirmPresetBtn = document.getElementById('confirmPresetBtn');
				var cancelPresetBtn = document.getElementById('cancelPresetBtn');
				var presetGrid = document.getElementById('presetGrid');
				var selectedPresetKey = null;

				presetCards.forEach(function(card){
					card.addEventListener('click', function(){
						var key = card.getAttribute('data-preset');
						var preset = presets[key];
						if(!preset) return;
						selectedPresetKey = key;
						presetCards.forEach(function(c){ c.style.borderColor='rgba(140,82,255,0.4)'; c.style.background='rgba(45,21,68,0.7)'; });
						card.style.borderColor='#00c16e';
						card.style.background='rgba(0,193,110,0.15)';
						if(presetNameEl) presetNameEl.textContent = preset.name;
						if(presetProvidersEl) presetProvidersEl.innerHTML = preset.providers.map(function(p){ return '<span style="display:inline-block; padding:0.25rem 0.6rem; margin:0.2rem; background:rgba(140,82,255,0.2); border:1px solid rgba(140,82,255,0.4); border-radius:6px; font-size:0.8rem;">' + p + '</span>'; }).join('');
						if(detailsPanel) detailsPanel.style.display = 'block';
						if(presetGrid) presetGrid.style.display = 'none';
					});
				});

				if(cancelPresetBtn) cancelPresetBtn.addEventListener('click', function(){
					if(detailsPanel) detailsPanel.style.display = 'none';
					if(presetGrid) presetGrid.style.display = 'grid';
					selectedPresetKey = null;
					presetCards.forEach(function(c){ c.style.borderColor='rgba(140,82,255,0.4)'; c.style.background='rgba(45,21,68,0.7)'; });
				});

				if(confirmPresetBtn) confirmPresetBtn.addEventListener('click', function(){
					var preset = presets[selectedPresetKey];
					if(!preset) return;
					var config = JSON.parse(JSON.stringify(preset.config));
					var presetTmdbInput = document.getElementById('presetTmdbKey');
					if (presetTmdbInput && presetTmdbInput.value.trim()) {
						config.tmdbApiKey = presetTmdbInput.value.trim();
					}
					showInstallPanel(config);
				});

				function showInstallPanel(config){
					var configStr = JSON.stringify(config);
					var encodedConfig = btoa(configStr);
					var stremioUrl = 'stremio://' + window.location.host + '/' + encodedConfig + '/manifest.json';
					var manifestUrl = window.location.protocol + '//' + window.location.host + '/' + encodedConfig + '/manifest.json';

					if(detailsPanel) detailsPanel.style.display = 'none';
					if(presetGrid) presetGrid.style.display = 'none';

					var existingInstall = document.getElementById('guidedInstallPanel');
					if(existingInstall) existingInstall.remove();

					var panel = document.createElement('div');
					panel.id = 'guidedInstallPanel';
					panel.style.cssText = 'text-align:center;padding:1.5rem;';
					panel.innerHTML = '<h3 style="color:#00c16e;margin:0 0 1rem 0;text-shadow:0 0 12px rgba(0,193,110,0.8);">✅ Configurazione Pronta!</h3>'
						+ '<div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-bottom:1.5rem;">'
						+ '<a href="' + stremioUrl + '" style="text-decoration:none;"><button type="button" style="padding:0.85rem 2.2rem;background:linear-gradient(135deg,#7c3aff,#a855f7);color:#fff;border:2px solid #c084fc;border-radius:10px;cursor:pointer;font-weight:800;font-size:1.05rem;letter-spacing:0.05em;box-shadow:0 0 18px rgba(168,85,247,0.9),0 0 40px rgba(168,85,247,0.45),inset 0 1px 0 rgba(255,255,255,0.15);text-shadow:0 0 8px rgba(255,255,255,0.6);transition:all 0.2s ease;">🎬 INSTALLA SU STREMIO</button></a>'
						+ '<button id="guidedCopyBtn" type="button" style="padding:0.85rem 2.2rem;background:linear-gradient(135deg,#1e3a8a,#2563eb);color:#fff;border:2px solid #60a5fa;border-radius:10px;cursor:pointer;font-weight:800;font-size:1.05rem;letter-spacing:0.05em;box-shadow:0 0 18px rgba(96,165,250,0.9),0 0 40px rgba(96,165,250,0.45),inset 0 1px 0 rgba(255,255,255,0.15);text-shadow:0 0 8px rgba(255,255,255,0.6);transition:all 0.2s ease;">📋 COPIA MANIFEST URL</button>'
						+ '</div>'
						+ '<div style="text-align:center;margin-top:1rem;"><button id="guidedBackBtn" type="button" style="display:inline-block;padding:0.75rem 2rem;background:linear-gradient(135deg,rgba(140,82,255,0.25),rgba(100,50,200,0.35));color:#e0ccff;border:1.5px solid rgba(180,130,255,0.7);border-radius:30px;cursor:pointer;font-weight:700;font-size:0.95rem;letter-spacing:0.03em;box-shadow:0 0 14px rgba(140,82,255,0.45),0 0 30px rgba(140,82,255,0.2);transition:all 0.25s ease;">⬅ Riconfigura</button></div>';

					var guidedSec = document.getElementById('guidedInstallerSection');
					if(guidedSec) guidedSec.appendChild(panel);

					var copyBtn = document.getElementById('guidedCopyBtn');
					if(copyBtn){
						copyBtn.addEventListener('click', function(){
							try {
								navigator.clipboard.writeText(manifestUrl).then(function(){
									copyBtn.textContent='COPIATO!';
									copyBtn.style.background='linear-gradient(135deg,#065f46,#059669)';
									copyBtn.style.borderColor='#34d399';
									copyBtn.style.boxShadow='0 0 18px rgba(52,211,153,0.9),0 0 40px rgba(52,211,153,0.45)';
									setTimeout(function(){
										copyBtn.textContent='COPIA MANIFEST URL';
										copyBtn.style.background='linear-gradient(135deg,#1e3a8a,#2563eb)';
										copyBtn.style.borderColor='#60a5fa';
										copyBtn.style.boxShadow='0 0 18px rgba(96,165,250,0.9),0 0 40px rgba(96,165,250,0.45)';
									},1600);
								});
							} catch(e) { alert('Copia manualmente: ' + manifestUrl); }
						});
					}

					var backBtn = document.getElementById('guidedBackBtn');
					if(backBtn){
						backBtn.addEventListener('click', function(){
							panel.remove();
							if(presetGrid) presetGrid.style.display = 'grid';
							selectedPresetKey = null;
							presetCards.forEach(function(c){ c.style.borderColor='rgba(140,82,255,0.4)'; c.style.background='rgba(45,21,68,0.7)'; });
						});
					}
				}
			})();
		</script>
	</body>

	</html>`
}

export { landingTemplate };
