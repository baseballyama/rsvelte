import * as $ from 'svelte/internal/server';
import { slide } from 'svelte/transition';
import Icon from '$lib/components/global/Icon.svelte';
import { accessibility } from '$lib/stores/accessibility';
import { tooltip } from '$lib/actions/tooltip';
import { theme, themes } from '$lib/stores/theme';
import { navbarDisplay, navbarDisplayOptions } from '$lib/stores/navbarDisplay';
import { homepageLayout, homepageLayoutOptions } from '$lib/stores/homepageLayout';
import { customCss } from '$lib/stores/customCss';
import { siteCustomization } from '$lib/stores/siteCustomization';
import { primaryColor } from '$lib/stores/primaryColor';
import { fontScale, fontScaleOptions } from '$lib/stores/fontScale';
import { storage } from '$lib/utils/localStorage';
import * as config from '$lib/config/customizable-settings';
import SegmentedControl from '$lib/components/global/SegmentedControl.svelte';

function validationMessages($$renderer, errors, warnings) {
	if (errors.length > 0) {
		$$renderer.push(`<!--[0--><div class="validation-messages errors svelte-feb5js">`);
		Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
		$$renderer.push(`<!----> <div><!--[-->`);

		const each_array = $.ensure_array_like(errors);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let error = each_array[$$index];

			$$renderer.push(`<p class="svelte-feb5js">${$.escape(error)}</p>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> `);

	if (warnings.length > 0) {
		$$renderer.push(`<!--[0--><div class="validation-messages warnings svelte-feb5js">`);
		Icon($$renderer, { name: 'alert-circle', size: 'sm' });
		$$renderer.push(`<!----> <div><!--[-->`);

		const each_array_1 = $.ensure_array_like(warnings);

		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let warning = each_array_1[$$index_1];

			$$renderer.push(`<p class="svelte-feb5js">${$.escape(warning)}</p>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}

function actionButtons(
	$$renderer,
	applyHandler,
	clearHandler,
	applyLabel = 'Apply',
	clearLabel = 'Clear'
) {
	$$renderer.push(`<div class="css-actions svelte-feb5js"><button class="action-btn apply svelte-feb5js">`);
	Icon($$renderer, { name: 'check', size: 'sm' });
	$$renderer.push(`<!----> ${$.escape(applyLabel)}</button> <button class="action-btn clear svelte-feb5js">`);
	Icon($$renderer, { name: clearLabel === 'Reset' ? 'x' : 'undo', size: 'sm' });
	$$renderer.push(`<!----> ${$.escape(clearLabel)}</button></div>`);
}

export default function SettingsPanel($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { standalone = false, onClose } = $$props;

		// UI State
		let showMoreA11y = standalone;

		let showMoreThemes = standalone;
		let showCustomColorInput = false;
		let selectedLanguage = 'en';

		// Store subscriptions
		let accessibilitySettings = accessibility;

		let currentTheme = theme;
		let currentNavbarDisplay = navbarDisplay;
		let currentHomepageLayout = homepageLayout;
		let currentCustomCss = customCss;
		let currentFontScale = fontScale;

		// Form inputs
		let cssInput = '';

		let siteTitleInput = '';
		let siteDescriptionInput = '';
		let siteIconUrlInput = '';
		let primaryColorInput = '';

		// Validation & sync state
		let validationErrors = [];

		let validationWarnings = [];
		let siteCustomizationErrors = [];
		let lastStoreValue = '';
		let lastColorStoreValue = '';
		let envVarsCopied = false;
		let envFormat = 'env';
		let showExportSettings = false;
		let showExportStyles = false;

		// Constants
		const PRIMARY_A11Y_OPTIONS = [];

		const COLOR_PALETTE = [
			'#1a75ff',
			'#7711ff',
			'#dd11ff',
			'#ff1aaa',
			'#ff1a1a',
			'#ff4422',
			'#ff7711',
			'#ffaa00',
			'#ffdd00',
			'#aadd00',
			'#11dd00',
			'#00ff77',
			'#00dddd',
			'#11bbff',
			'#44aaff',
			'#7777ff'
		];

		const LANGUAGES = [
			{ code: 'en', name: 'English', available: true, flag: '🇺🇸' },
			{ code: 'es', name: 'Español', available: false, flag: '🇪🇸' },
			{ code: 'fr', name: 'Français', available: false, flag: '🇫🇷' },
			{ code: 'de', name: 'Deutsch', available: false, flag: '🇩🇪' }
		];

		// Derived state
		const primaryOptions = $.derived(() => $.store_get($$store_subs ??= {}, '$accessibilitySettings', accessibilitySettings).options.filter((opt) => PRIMARY_A11Y_OPTIONS.includes(opt.id)));

		// const primaryOptions = $derived(
		//   $accessibilitySettings.options.filter((opt) => PRIMARY_A11Y_OPTIONS.includes(opt.id)),
		// );
		const additionalOptions = $.derived(() => $.store_get($$store_subs ??= {}, '$accessibilitySettings', accessibilitySettings).options.filter((opt) => !PRIMARY_A11Y_OPTIONS.includes(opt.id)));

		// Sync effects
		// Event handlers
		const handlers = {
			themeChange: (themeId) => theme.setTheme(themeId),
			a11yToggle: (optionId) => accessibility.toggle(optionId),
			navbarChange: (e) => navbarDisplay.setMode(e.currentTarget.value),
			homepageChange: (e) => homepageLayout.setMode(e.currentTarget.value),
			fontScaleChange: (e) => fontScale.setLevel(parseInt(e.currentTarget.value, 10)),
			linkClick: () => onClose?.(),
			applyCustomCss: () => {
				const validation = customCss.validate(cssInput);

				validationErrors = validation.errors;
				validationWarnings = validation.warnings;

				if (validation.isValid) customCss.set(cssInput);
			},

			clearCustomCss: () => {
				cssInput = '';
				customCss.clear();
				validationErrors = [];
				validationWarnings = [];
			},

			applySiteCustomization: () => {
				const data = {
					title: siteTitleInput.trim(),
					description: siteDescriptionInput.trim(),
					iconUrl: siteIconUrlInput.trim()
				};

				const validation = siteCustomization.validate(data);

				siteCustomizationErrors = validation.errors;

				if (validation.isValid) {
					siteCustomization.set(data);
					window.location.reload();
				}
			},

			clearSiteCustomization: () => {
				siteCustomization.clear();
				siteCustomizationErrors = [];
				window.location.reload();
			},

			resetColor: () => {
				primaryColorInput = '';
			},

			clearAllData: () => {
				if (window.confirm('Your theme, language, home and nav layout, site branding, accessibility preferences, custom CSS and all other settings will be discarded. This will also clear your bookmarks, recent tools and other history. Are you sure you want to proceed?')) {
					storage.clear();
					window.location.reload();
				}
			},

			copyEnvVars: async () => {
				try {
					await navigator.clipboard.writeText(envVarsString());
					envVarsCopied = true;
					setTimeout(() => envVarsCopied = false, 2000);
				} catch {
					const textArea = document.createElement('textarea');

					textArea.value = envVarsString();
					document.body.appendChild(textArea);
					textArea.select();
					document.execCommand('copy');
					document.body.removeChild(textArea);
					envVarsCopied = true;
					setTimeout(() => envVarsCopied = false, 2000);
				}
			}
		};

		// Live-updating env vars string - reacts to store changes
		const envVarsString = $.derived(() => {
			// Trigger reactivity on store changes
			void $.store_get($$store_subs ??= {}, '$currentTheme', currentTheme);

			void $.store_get($$store_subs ??= {}, '$currentFontScale', currentFontScale);
			void $.store_get($$store_subs ??= {}, '$currentHomepageLayout', currentHomepageLayout);
			void $.store_get($$store_subs ??= {}, '$currentNavbarDisplay', currentNavbarDisplay);
			void $.store_get($$store_subs ??= {}, '$primaryColor', primaryColor);
			void $.store_get($$store_subs ??= {}, '$siteCustomization', siteCustomization);

			const envVars = config.getUserSettingsList();

			if (envFormat === 'docker') {
				const filtered = envVars.filter(({ value }) => value !== '');

				return 'environment:\n' + filtered.map(({ name, value }) => `  - ${name}=${value}`).join('\n');
			}

			return envVars.map(({ name, value }) => `${name}='${value}'`).join('\n');
		});

		function accessibilityOption($$renderer, option) {
			$$renderer.push(`<label class="toggle-option svelte-feb5js"><input type="checkbox"${$.attr('checked', option.enabled, true)}${$.attr('aria-describedby', `a11y-${$.stringify(option.id)}-desc`)} class="svelte-feb5js"/> <span class="toggle-slider svelte-feb5js"></span> <div class="toggle-content svelte-feb5js"><span>${$.escape(option.name)}</span> <small${$.attr('id', `a11y-${$.stringify(option.id)}-desc`)} class="toggle-description svelte-feb5js">${$.escape(option.description)}</small></div></label>`);
		}

		function themeButton($$renderer, themeOption) {
			$$renderer.push(`<button${$.attr_class('theme-option svelte-feb5js', void 0, {
				'active': $.store_get($$store_subs ??= {}, '$currentTheme', currentTheme) === themeOption.id,
				'disabled': !themeOption.available
			})} role="radio"${$.attr('aria-checked', $.store_get($$store_subs ??= {}, '$currentTheme', currentTheme) === themeOption.id)}${$.attr('disabled', !themeOption.available, true)}><div class="theme-preview svelte-feb5js"${$.attr_style(`background: ${$.stringify(themeOption.preview || 'var(--bg-secondary)')}`)}></div> <span>${$.escape(themeOption.name)}
      ${$.escape(!themeOption.available ? ' (Soon)' : '')}</span></button>`);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_class('settings-panel svelte-feb5js', void 0, { 'standalone': standalone })}><div class="settings-section theme-section svelte-feb5js"><h3 class="svelte-feb5js">Theme</h3> <div class="theme-options svelte-feb5js" role="radiogroup" aria-label="Theme selection"><!--[-->`);

			const each_array_2 = $.ensure_array_like(themes.slice(0, 6));

			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
				let themeOption = each_array_2[$$index_2];

				themeButton($$renderer, themeOption);
			}

			$$renderer.push(`<!--]--> `);

			if (showMoreThemes && themes.length > 6) {
				$$renderer.push(`<!--[0--><div class="additional-themes svelte-feb5js"><!--[-->`);

				const each_array_3 = $.ensure_array_like(themes.slice(6));

				for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
					let themeOption = each_array_3[$$index_3];

					themeButton($$renderer, themeOption);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (themes.length > 6 && !standalone) {
				$$renderer.push(`<!--[0--><button class="show-more-btn svelte-feb5js"${$.attr('aria-expanded', showMoreThemes)}>`);

				Icon($$renderer, {
					name: showMoreThemes ? 'chevron-up' : 'chevron-down',
					size: 'sm'
				});

				$$renderer.push(`<!----> <span>${$.escape(showMoreThemes ? 'Show less' : 'Show more themes')}</span></button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div> `);

			if (standalone) {
				$$renderer.push(`<!--[0--><div class="settings-section font-size-section svelte-feb5js"><h3 class="svelte-feb5js">Font Scale</h3> <div class="font-scale-slider svelte-feb5js"><input type="range" min="0" max="4" step="1"${$.attr('value', $.store_get($$store_subs ??= {}, '$currentFontScale', currentFontScale))} aria-label="Font scale" class="slider svelte-feb5js"/> <div class="slider-labels svelte-feb5js"><!--[-->`);

				const each_array_4 = $.ensure_array_like(fontScaleOptions);

				for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
					let option = each_array_4[$$index_4];

					$$renderer.push(`<span${$.attr_class('slider-label svelte-feb5js', void 0, {
						'active': $.store_get($$store_subs ??= {}, '$currentFontScale', currentFontScale) === option.level
					})}>${$.escape(option.label)}</span>`);
				}

				$$renderer.push(`<!--]--></div></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="settings-section language-section svelte-feb5js"><h3 class="svelte-feb5js">Language</h3> <div class="language-dropdown svelte-feb5js"><!--[-->`);

			const each_array_5 = $.ensure_array_like(LANGUAGES);

			for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
				let lang = each_array_5[$$index_5];

				$$renderer.push(`<button${$.attr_class('language-option svelte-feb5js', void 0, {
					'active': selectedLanguage === lang.code,
					'disabled': !lang.available
				})}${$.attr('disabled', !lang.available, true)}>${$.escape(lang.flag)}
          ${$.escape(lang.name)}</button>`);
			}

			$$renderer.push(`<!--]--></div></div> <div class="settings-section homepage-layout-section svelte-feb5js"><h3 class="svelte-feb5js">Homepage Layout</h3> <div class="navbar-select-wrapper svelte-feb5js">`);

			$$renderer.select(
				{
					class: 'navbar-select',
					value: $.store_get($$store_subs ??= {}, '$currentHomepageLayout', currentHomepageLayout),
					onchange: handlers.homepageChange
				},
				($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array_6 = $.ensure_array_like(homepageLayoutOptions);

					for (let $$index_6 = 0, $$length = each_array_6.length; $$index_6 < $$length; $$index_6++) {
						let option = each_array_6[$$index_6];

						$$renderer.option(
							{ value: option.id, class: '' },
							($$renderer) => {
								$$renderer.push(`${$.escape(option.name)}`);
							},
							'svelte-feb5js'
						);
					}

					$$renderer.push(`<!--]-->`);
				},
				'svelte-feb5js'
			);

			$$renderer.push(` <div class="dropdown-icon svelte-feb5js">`);
			Icon($$renderer, { name: 'chevron-down', size: 'xs' });
			$$renderer.push(`<!----></div></div> <small class="navbar-description svelte-feb5js">${$.escape(homepageLayoutOptions.find((opt) => opt.id === $.store_get($$store_subs ??= {}, '$currentHomepageLayout', currentHomepageLayout))?.description)}</small></div> <div class="settings-section navbar-display-section svelte-feb5js"><h3 class="svelte-feb5js">Top Navigation</h3> <div class="navbar-select-wrapper svelte-feb5js">`);

			$$renderer.select(
				{
					class: 'navbar-select',
					value: $.store_get($$store_subs ??= {}, '$currentNavbarDisplay', currentNavbarDisplay),
					onchange: handlers.navbarChange
				},
				($$renderer) => {
					$$renderer.push(`<!--[-->`);

					const each_array_7 = $.ensure_array_like(navbarDisplayOptions);

					for (let $$index_7 = 0, $$length = each_array_7.length; $$index_7 < $$length; $$index_7++) {
						let option = each_array_7[$$index_7];

						$$renderer.option(
							{ value: option.id, class: '' },
							($$renderer) => {
								$$renderer.push(`${$.escape(option.name)}`);
							},
							'svelte-feb5js'
						);
					}

					$$renderer.push(`<!--]-->`);
				},
				'svelte-feb5js'
			);

			$$renderer.push(` <div class="dropdown-icon svelte-feb5js">`);
			Icon($$renderer, { name: 'chevron-down', size: 'xs' });
			$$renderer.push(`<!----></div></div> <small class="navbar-description svelte-feb5js">${$.escape(navbarDisplayOptions.find((opt) => opt.id === $.store_get($$store_subs ??= {}, '$currentNavbarDisplay', currentNavbarDisplay))?.description)}</small></div> <div class="settings-section accessibility-section svelte-feb5js"><h3 class="svelte-feb5js">Accessibility</h3> <div class="accessibility-options svelte-feb5js"><!--[-->`);

			const each_array_8 = $.ensure_array_like(primaryOptions());

			for (let $$index_8 = 0, $$length = each_array_8.length; $$index_8 < $$length; $$index_8++) {
				let option = each_array_8[$$index_8];

				accessibilityOption($$renderer, option);
			}

			$$renderer.push(`<!--]--> `);

			if (showMoreA11y) {
				$$renderer.push(`<!--[0--><div class="additional-options svelte-feb5js"><!--[-->`);

				const each_array_9 = $.ensure_array_like(additionalOptions());

				for (let $$index_9 = 0, $$length = each_array_9.length; $$index_9 < $$length; $$index_9++) {
					let option = each_array_9[$$index_9];

					accessibilityOption($$renderer, option);
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (!standalone) {
				$$renderer.push(`<!--[0--><button class="show-more-btn svelte-feb5js"${$.attr('aria-expanded', showMoreA11y)}>`);

				Icon($$renderer, {
					name: showMoreA11y ? 'chevron-up' : 'chevron-down',
					size: 'sm'
				});

				$$renderer.push(`<!----> <span>${$.escape(showMoreA11y ? 'Show less' : 'Show all a11y options')}</span></button>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div> `);

			if (standalone) {
				$$renderer.push(`<!--[0--><div class="settings-section site-branding-section svelte-feb5js"><h3 class="svelte-feb5js">Site Branding</h3> <p class="section-description svelte-feb5js">Customize the site title, description, and icon.</p> <div class="form-field svelte-feb5js"><label for="site-title" class="svelte-feb5js">Site Title</label> <input id="site-title" type="text"${$.attr('value', siteTitleInput)} placeholder="Networking Toolbox" maxlength="100" class="svelte-feb5js"/></div> <div class="form-field svelte-feb5js"><label for="site-description" class="svelte-feb5js">Description</label> <input id="site-description" type="text"${$.attr('value', siteDescriptionInput)} placeholder="Your companion for all-things networking" maxlength="300" class="svelte-feb5js"/></div> <div class="form-field svelte-feb5js"><label for="site-icon-url" class="svelte-feb5js">Icon URL</label> <input id="site-icon-url" type="text"${$.attr('value', siteIconUrlInput)} placeholder="/favicon.svg or https://example.com/icon.png" class="svelte-feb5js"/></div> `);
				validationMessages($$renderer, siteCustomizationErrors, []);
				$$renderer.push(`<!----> `);
				actionButtons($$renderer, handlers.applySiteCustomization, handlers.clearSiteCustomization, 'Apply', 'Reset');
				$$renderer.push(`<!----></div> <div class="settings-section color-section svelte-feb5js"><h3 class="svelte-feb5js">Primary Color</h3> <p class="section-description svelte-feb5js">Choose a primary color for the interface.</p> <div class="color-palette svelte-feb5js"><!--[-->`);

				const each_array_10 = $.ensure_array_like(COLOR_PALETTE);

				for (let $$index_10 = 0,
					$$length = each_array_10.length; $$index_10 < $$length; $$index_10++) {
					let color = each_array_10[$$index_10];

					$$renderer.push(`<button${$.attr_class('color-swatch svelte-feb5js', void 0, { 'active': primaryColorInput === color })}${$.attr_style(`background-color: ${$.stringify(color)};`)}${$.attr('aria-label', `Select color ${$.stringify(color)}`)}></button>`);
				}

				$$renderer.push(`<!--]--></div> <div class="color-actions svelte-feb5js"><button class="custom-color-toggle svelte-feb5js">`);
				Icon($$renderer, { name: 'palette', size: 'sm' });
				$$renderer.push(`<!----> Use Custom Color</button> <button class="action-btn clear svelte-feb5js">`);
				Icon($$renderer, { name: 'undo', size: 'sm' });
				$$renderer.push(`<!----> Reset</button></div> `);

				if (showCustomColorInput) {
					$$renderer.push(`<!--[0--><div class="custom-color-inputs svelte-feb5js"><div class="color-picker-wrapper svelte-feb5js"><label for="color-picker" class="svelte-feb5js">Color Picker</label> <input id="color-picker" type="color"${$.attr('value', primaryColorInput)} class="svelte-feb5js"/></div> <div class="form-field svelte-feb5js"><label for="custom-hex" class="svelte-feb5js">Hex Code</label> <input id="custom-hex" type="text"${$.attr('value', primaryColorInput)} placeholder="#2563eb" maxlength="7" class="svelte-feb5js"/></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div> <div class="settings-section custom-css-section svelte-feb5js"><h3 class="svelte-feb5js">Custom CSS</h3> <p class="section-description svelte-feb5js">Add your own CSS to customize the appearance globally.</p> <textarea class="css-editor svelte-feb5js" placeholder="/* Enter your custom CSS here */" spellcheck="false" rows="5">`);

				const $$body = $.escape(cssInput);

				if ($$body) {
					$$renderer.push(`${$$body}`);
				} else {}

				$$renderer.push(`</textarea> <div class="css-meta svelte-feb5js"><span class="char-count svelte-feb5js">${$.escape(cssInput.length)} characters</span></div> `);
				validationMessages($$renderer, validationErrors, validationWarnings);
				$$renderer.push(`<!----> `);
				actionButtons($$renderer, handlers.applyCustomCss, handlers.clearCustomCss);
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (standalone) {
				$$renderer.push(`<!--[0--><div class="settings-section info-more-section svelte-feb5js"><h3 class="svelte-feb5js">Not found what you were looking for?</h3> <p class="line-1 svelte-feb5js">Good news! The code is open source and easy to work with.</p> <p class="svelte-feb5js">Simply <a href="https://github.com/Lissy93/networking-toolbox/fork" class="svelte-feb5js">fork the repo</a>, follow our <a href="/about/building" class="svelte-feb5js">dev setup instructions</a>, make whatever changes and customizations you like, and
        then <a href="/about/deploying" class="svelte-feb5js">deploy your own instance</a>.</p> <p class="svelte-feb5js">We also offer enterprise <a href="/about/support" class="svelte-feb5js">support services</a>, where we can make custom changes for
        you.</p></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (standalone) {
				$$renderer.push(`<!--[0--><div class="settings-section delete-section svelte-feb5js"><h3 class="svelte-feb5js">Delete Data</h3> <div class="caution-message svelte-feb5js">`);
				Icon($$renderer, { name: 'alert-triangle', size: 'sm' });
				$$renderer.push(`<!----> <p class="svelte-feb5js">Caution: This will reset all local data.</p></div> <button class="action-btn danger svelte-feb5js">`);
				Icon($$renderer, { name: 'trash', size: 'sm' });
				$$renderer.push(`<!----> Clear all Data</button></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (standalone) {
				$$renderer.push(`<!--[0--><div class="settings-section saving-section svelte-feb5js"><h3 class="svelte-feb5js">Syncing Settings and Backup/Restore</h3> <p class="line-1 svelte-feb5js">Your settings are saved in your browser's local storage, and so they will be retained even after you quit the
        app.</p> <p>Since we don't require login/signup to use the app, there is currently no way to automatically sync your
        settings across devices. But if you're self-hosting Networking Toolbox, you can apply settings in your config,
        by including the following environment variables. This way, you're settings will be applied to all users across
        all devices.</p> <button class="show-more-btn svelte-feb5js"${$.attr('aria-expanded', showExportSettings)}>`);

				Icon($$renderer, {
					name: showExportSettings ? 'chevron-up' : 'chevron-down',
					size: 'sm'
				});

				$$renderer.push(`<!----> <span>Export Settings</span></button> `);

				if (showExportSettings) {
					$$renderer.push(`<!--[0--><div class="env-vars-section svelte-feb5js"><div class="env-header svelte-feb5js"><h4 class="svelte-feb5js">Environment Variables</h4> `);

					SegmentedControl($$renderer, {
						options: [
							{ value: 'env', label: '.env' },
							{ value: 'docker', label: 'docker-compose' }
						],

						get value() {
							return envFormat;
						},

						set value($$value) {
							envFormat = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div> <p class="section-description svelte-feb5js">Current environment variable values. Copy and paste into your config file for self-hosted instances.</p> <pre class="env-block svelte-feb5js"><code class="svelte-feb5js">${$.escape(envVarsString())}</code></pre> <button class="action-btn apply svelte-feb5js">`);
					Icon($$renderer, { name: envVarsCopied ? 'check' : 'copy', size: 'sm' });
					$$renderer.push(`<!----> ${$.escape(envVarsCopied ? 'Copied!' : 'Copy to Clipboard')}</button></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <button class="show-more-btn svelte-feb5js"${$.attr('aria-expanded', showExportStyles)}>`);

				Icon($$renderer, {
					name: showExportStyles ? 'chevron-up' : 'chevron-down',
					size: 'sm'
				});

				$$renderer.push(`<!----> <span>Export Styles</span></button> `);

				if (showExportStyles) {
					$$renderer.push(`<!--[0--><div class="env-vars-section svelte-feb5js"><div class="env-header svelte-feb5js"><h4 class="svelte-feb5js">Custom CSS</h4></div> <p class="section-description svelte-feb5js">Apply your custom CSS to your self-hosted instance by mounting a CSS file.</p> <div class="code-block-section svelte-feb5js"><p class="code-label svelte-feb5js">1. Create a file named <code class="svelte-feb5js">custom-styles.css</code></p> <p class="code-label svelte-feb5js">2. Paste the following content:</p> <pre class="code-block svelte-feb5js"><code class="svelte-feb5js">${$.escape($.store_get($$store_subs ??= {}, '$currentCustomCss', currentCustomCss) || '/* No custom CSS saved yet */\n/* Add your custom styles in the Custom CSS section above */')}</code></pre> <p class="code-label svelte-feb5js">3. Mount the file to your Docker container:</p> <div class="mount-options svelte-feb5js"><p class="mount-option-label svelte-feb5js"><strong class="svelte-feb5js">Option A:</strong> Docker Compose</p> <pre class="code-block svelte-feb5js"><code class="svelte-feb5js">services:
  networking-toolbox:
    volumes:
      - ./custom-styles.css:/app/static/custom-styles.css:ro</code></pre> <p class="mount-option-label svelte-feb5js"><strong class="svelte-feb5js">Option B:</strong> Docker Run</p> <pre class="code-block svelte-feb5js"><code class="svelte-feb5js">docker run -v $(pwd)/custom-styles.css:/app/static/custom-styles.css:ro ...</code></pre> <p class="mount-option-label svelte-feb5js"><strong class="svelte-feb5js">Option C:</strong> Edit file directly in container</p> <pre class="code-block svelte-feb5js"><code class="svelte-feb5js">docker exec -it &lt;container-name> sh -c 'cat > /app/static/custom-styles.css &lt;&lt; "EOF"
${$.escape($.store_get($$store_subs ??= {}, '$currentCustomCss', currentCustomCss) || '/* Your custom CSS here */')}
EOF'</code></pre></div> <div class="info-message svelte-feb5js">`);

					Icon($$renderer, { name: 'info', size: 'sm' });

					$$renderer.push(`<!----> <p class="svelte-feb5js"><strong class="svelte-feb5js">Note:</strong> For Options A &amp; B, create the <code class="svelte-feb5js">custom-styles.css</code> file before starting
                your container. Docker cannot mount individual files that don't exist yet.</p></div></div></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> `);

			if (!standalone) {
				$$renderer.push(`<!--[0--><div class="settings-section settings-links svelte-feb5js"><a class="settings-link svelte-feb5js" href="/settings">`);
				Icon($$renderer, { name: 'settings', size: 'sm' });
				$$renderer.push(`<!----> <span>More Settings</span></a></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}