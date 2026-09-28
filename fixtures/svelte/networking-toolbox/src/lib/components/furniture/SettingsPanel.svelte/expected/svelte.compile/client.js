import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

const validationMessages = ($$anchor, errors = $.noop, warnings = $.noop) => {
	var fragment = root_3();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root_1();
			var node_1 = $.child(div);

			Icon(node_1, { name: 'alert-triangle', size: 'sm' });

			var div_1 = $.sibling(node_1, 2);

			$.each(div_1, 20, errors, (error) => error, ($$anchor, error) => {
				var p = root();
				var text = $.only_child(p, true);

				$.template_effect(() => $.set_text(text, error));
				$.append($$anchor, p);
			});

			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (errors().length > 0) $$render(consequent);
		});
	}

	var node_2 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_2 = root_2();
			var node_3 = $.child(div_2);

			Icon(node_3, { name: 'alert-circle', size: 'sm' });

			var div_3 = $.sibling(node_3, 2);

			$.each(div_3, 20, warnings, (warning) => warning, ($$anchor, warning) => {
				var p_1 = root();
				var text_1 = $.only_child(p_1, true);

				$.template_effect(() => $.set_text(text_1, warning));
				$.append($$anchor, p_1);
			});

			$.reset(div_3);
			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node_2, ($$render) => {
			if (warnings().length > 0) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
};

const actionButtons = (
	$$anchor,
	applyHandler = $.noop,
	clearHandler = $.noop,
	$$arg2,
	$$arg3
) => {
	let applyLabel = $.derived_safe_equal(() => $.fallback($$arg2?.(), 'Apply'));
	let clearLabel = $.derived_safe_equal(() => $.fallback($$arg3?.(), 'Clear'));
	var div_4 = root_4();
	var button = $.child(div_4);
	var node_4 = $.child(button);

	Icon(node_4, { name: 'check', size: 'sm' });

	var text_2 = $.sibling(node_4);

	$.reset(button);

	var button_1 = $.sibling(button, 2);
	var node_5 = $.child(button_1);

	{
		let $0 = $.derived(() => $.get(clearLabel) === 'Reset' ? 'x' : 'undo');

		Icon(node_5, {
			get name() {
				return $.get($0);
			},
			size: 'sm'
		});
	}

	var text_3 = $.sibling(node_5);

	$.reset(button_1);
	$.reset(div_4);

	$.template_effect(() => {
		$.set_text(text_2, ` ${$.get(applyLabel) ?? ''}`);
		$.set_text(text_3, ` ${$.get(clearLabel) ?? ''}`);
	});

	$.delegated('click', button, function (...$$args) {
		applyHandler()?.apply(this, $$args);
	});

	$.delegated('click', button_1, function (...$$args) {
		clearHandler()?.apply(this, $$args);
	});

	$.append($$anchor, div_4);
};

var root = $.from_html(`<p class="svelte-feb5js"> </p>`);
var root_1 = $.from_html(`<div class="validation-messages errors svelte-feb5js"><!> <div></div></div>`);
var root_2 = $.from_html(`<div class="validation-messages warnings svelte-feb5js"><!> <div></div></div>`);
var root_3 = $.from_html(`<!> <!>`, 1);
var root_4 = $.from_html(`<div class="css-actions svelte-feb5js"><button class="action-btn apply svelte-feb5js"><!> </button> <button class="action-btn clear svelte-feb5js"><!> </button></div>`);
var root_5 = $.from_html(`<label class="toggle-option svelte-feb5js"><input type="checkbox" class="svelte-feb5js"/> <span class="toggle-slider svelte-feb5js"></span> <div class="toggle-content svelte-feb5js"><span> </span> <small class="toggle-description svelte-feb5js"> </small></div></label>`);
var root_6 = $.from_html(`<button role="radio"><div class="theme-preview svelte-feb5js"></div> <span> </span></button>`);
var root_7 = $.from_html(`<div class="additional-themes svelte-feb5js"></div>`);
var root_8 = $.from_html(`<button class="show-more-btn svelte-feb5js"><!> <span> </span></button>`);
var root_9 = $.from_html(`<span> </span>`);
var root_10 = $.from_html(`<div class="settings-section font-size-section svelte-feb5js"><h3 class="svelte-feb5js">Font Scale</h3> <div class="font-scale-slider svelte-feb5js"><input type="range" min="0" max="4" step="1" aria-label="Font scale" class="slider svelte-feb5js"/> <div class="slider-labels svelte-feb5js"></div></div></div>`);
var root_11 = $.from_html(`<button> </button>`);
var root_12 = $.from_html(`<option class="svelte-feb5js"> </option>`);
var root_13 = $.from_html(`<div class="additional-options svelte-feb5js"></div>`);
var root_14 = $.from_html(`<button></button>`);
var root_15 = $.from_html(`<div class="custom-color-inputs svelte-feb5js"><div class="color-picker-wrapper svelte-feb5js"><label for="color-picker" class="svelte-feb5js">Color Picker</label> <input id="color-picker" type="color" class="svelte-feb5js"/></div> <div class="form-field svelte-feb5js"><label for="custom-hex" class="svelte-feb5js">Hex Code</label> <input id="custom-hex" type="text" placeholder="#2563eb" maxlength="7" class="svelte-feb5js"/></div></div>`);
var root_16 = $.from_html(`<div class="settings-section site-branding-section svelte-feb5js"><h3 class="svelte-feb5js">Site Branding</h3> <p class="section-description svelte-feb5js">Customize the site title, description, and icon.</p> <div class="form-field svelte-feb5js"><label for="site-title" class="svelte-feb5js">Site Title</label> <input id="site-title" type="text" placeholder="Networking Toolbox" maxlength="100" class="svelte-feb5js"/></div> <div class="form-field svelte-feb5js"><label for="site-description" class="svelte-feb5js">Description</label> <input id="site-description" type="text" placeholder="Your companion for all-things networking" maxlength="300" class="svelte-feb5js"/></div> <div class="form-field svelte-feb5js"><label for="site-icon-url" class="svelte-feb5js">Icon URL</label> <input id="site-icon-url" type="text" placeholder="/favicon.svg or https://example.com/icon.png" class="svelte-feb5js"/></div> <!> <!></div> <div class="settings-section color-section svelte-feb5js"><h3 class="svelte-feb5js">Primary Color</h3> <p class="section-description svelte-feb5js">Choose a primary color for the interface.</p> <div class="color-palette svelte-feb5js"></div> <div class="color-actions svelte-feb5js"><button class="custom-color-toggle svelte-feb5js"><!> Use Custom Color</button> <button class="action-btn clear svelte-feb5js"><!> Reset</button></div> <!></div> <div class="settings-section custom-css-section svelte-feb5js"><h3 class="svelte-feb5js">Custom CSS</h3> <p class="section-description svelte-feb5js">Add your own CSS to customize the appearance globally.</p> <textarea class="css-editor svelte-feb5js" placeholder="/* Enter your custom CSS here */" spellcheck="false" rows="5"></textarea> <div class="css-meta svelte-feb5js"><span class="char-count svelte-feb5js"> </span></div> <!> <!></div>`, 1);

var root_17 = $.from_html(`<div class="settings-section info-more-section svelte-feb5js"><h3 class="svelte-feb5js">Not found what you were looking for?</h3> <p class="line-1 svelte-feb5js">Good news! The code is open source and easy to work with.</p> <p class="svelte-feb5js">Simply <a href="https://github.com/Lissy93/networking-toolbox/fork" class="svelte-feb5js">fork the repo</a>, follow our <a href="/about/building" class="svelte-feb5js">dev setup instructions</a>, make whatever changes and customizations you like, and
        then <a href="/about/deploying" class="svelte-feb5js">deploy your own instance</a>.</p> <p class="svelte-feb5js">We also offer enterprise <a href="/about/support" class="svelte-feb5js">support services</a>, where we can make custom changes for
        you.</p></div>`);

var root_18 = $.from_html(`<div class="settings-section delete-section svelte-feb5js"><h3 class="svelte-feb5js">Delete Data</h3> <div class="caution-message svelte-feb5js"><!> <p class="svelte-feb5js">Caution: This will reset all local data.</p></div> <button class="action-btn danger svelte-feb5js"><!> Clear all Data</button></div>`);
var root_19 = $.from_html(`<div class="env-vars-section svelte-feb5js"><div class="env-header svelte-feb5js"><h4 class="svelte-feb5js">Environment Variables</h4> <!></div> <p class="section-description svelte-feb5js">Current environment variable values. Copy and paste into your config file for self-hosted instances.</p> <pre class="env-block svelte-feb5js"><code class="svelte-feb5js"> </code></pre> <button class="action-btn apply svelte-feb5js"><!> </button></div>`);

var root_20 = $.from_html(`<div class="env-vars-section svelte-feb5js"><div class="env-header svelte-feb5js"><h4 class="svelte-feb5js">Custom CSS</h4></div> <p class="section-description svelte-feb5js">Apply your custom CSS to your self-hosted instance by mounting a CSS file.</p> <div class="code-block-section svelte-feb5js"><p class="code-label svelte-feb5js">1. Create a file named <code class="svelte-feb5js">custom-styles.css</code></p> <p class="code-label svelte-feb5js">2. Paste the following content:</p> <pre class="code-block svelte-feb5js"><code class="svelte-feb5js"> </code></pre> <p class="code-label svelte-feb5js">3. Mount the file to your Docker container:</p> <div class="mount-options svelte-feb5js"><p class="mount-option-label svelte-feb5js"><strong class="svelte-feb5js">Option A:</strong> Docker Compose</p> <pre class="code-block svelte-feb5js"><code class="svelte-feb5js">services:
  networking-toolbox:
    volumes:
      - ./custom-styles.css:/app/static/custom-styles.css:ro</code></pre> <p class="mount-option-label svelte-feb5js"><strong class="svelte-feb5js">Option B:</strong> Docker Run</p> <pre class="code-block svelte-feb5js"><code class="svelte-feb5js">docker run -v $(pwd)/custom-styles.css:/app/static/custom-styles.css:ro ...</code></pre> <p class="mount-option-label svelte-feb5js"><strong class="svelte-feb5js">Option C:</strong> Edit file directly in container</p> <pre class="code-block svelte-feb5js"><code class="svelte-feb5js"> </code></pre></div> <div class="info-message svelte-feb5js"><!> <p class="svelte-feb5js"><strong class="svelte-feb5js">Note:</strong> For Options A &amp; B, create the <code class="svelte-feb5js">custom-styles.css</code> file before starting
                your container. Docker cannot mount individual files that don't exist yet.</p></div></div></div>`);

var root_21 = $.from_html(`<div class="settings-section saving-section svelte-feb5js"><h3 class="svelte-feb5js">Syncing Settings and Backup/Restore</h3> <p class="line-1 svelte-feb5js">Your settings are saved in your browser's local storage, and so they will be retained even after you quit the
        app.</p> <p>Since we don't require login/signup to use the app, there is currently no way to automatically sync your
        settings across devices. But if you're self-hosting Networking Toolbox, you can apply settings in your config,
        by including the following environment variables. This way, you're settings will be applied to all users across
        all devices.</p> <button class="show-more-btn svelte-feb5js"><!> <span>Export Settings</span></button> <!> <button class="show-more-btn svelte-feb5js"><!> <span>Export Styles</span></button> <!></div>`);

var root_22 = $.from_html(`<div class="settings-section settings-links svelte-feb5js"><a class="settings-link svelte-feb5js" href="/settings"><!> <span>More Settings</span></a></div>`);
var root_23 = $.from_html(`<div><div class="settings-section theme-section svelte-feb5js"><h3 class="svelte-feb5js">Theme</h3> <div class="theme-options svelte-feb5js" role="radiogroup" aria-label="Theme selection"><!> <!></div> <!></div> <!> <div class="settings-section language-section svelte-feb5js"><h3 class="svelte-feb5js">Language</h3> <div class="language-dropdown svelte-feb5js"></div></div> <div class="settings-section homepage-layout-section svelte-feb5js"><h3 class="svelte-feb5js">Homepage Layout</h3> <div class="navbar-select-wrapper svelte-feb5js"><select class="navbar-select svelte-feb5js"></select> <div class="dropdown-icon svelte-feb5js"><!></div></div> <small class="navbar-description svelte-feb5js"> </small></div> <div class="settings-section navbar-display-section svelte-feb5js"><h3 class="svelte-feb5js">Top Navigation</h3> <div class="navbar-select-wrapper svelte-feb5js"><select class="navbar-select svelte-feb5js"></select> <div class="dropdown-icon svelte-feb5js"><!></div></div> <small class="navbar-description svelte-feb5js"> </small></div> <div class="settings-section accessibility-section svelte-feb5js"><h3 class="svelte-feb5js">Accessibility</h3> <div class="accessibility-options svelte-feb5js"><!> <!> <!></div></div> <!> <!> <!> <!> <!></div>`);

export default function SettingsPanel($$anchor, $$props) {
	$.push($$props, true);

	const $accessibilitySettings = () => $.store_get(accessibilitySettings, '$accessibilitySettings', $$stores);
	const $currentCustomCss = () => $.store_get(currentCustomCss, '$currentCustomCss', $$stores);
	const $siteCustomization = () => $.store_get(siteCustomization, '$siteCustomization', $$stores);
	const $primaryColor = () => $.store_get(primaryColor, '$primaryColor', $$stores);
	const $currentTheme = () => $.store_get(currentTheme, '$currentTheme', $$stores);
	const $currentFontScale = () => $.store_get(currentFontScale, '$currentFontScale', $$stores);
	const $currentHomepageLayout = () => $.store_get(currentHomepageLayout, '$currentHomepageLayout', $$stores);
	const $currentNavbarDisplay = () => $.store_get(currentNavbarDisplay, '$currentNavbarDisplay', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	const // UI State
	// Store subscriptions
	// Form inputs
	// Validation & sync state
	// Constants
	// Derived state
	// const primaryOptions = $derived(
	//   $accessibilitySettings.options.filter((opt) => PRIMARY_A11Y_OPTIONS.includes(opt.id)),
	// );
	// Sync effects
	// Event handlers
	// Live-updating env vars string - reacts to store changes
	// Trigger reactivity on store changes
	accessibilityOption = ($$anchor, option = $.noop) => {
		var label = root_5();
		var input = $.child(label);

		$.remove_input_defaults(input);

		var div_5 = $.sibling(input, 4);
		var span = $.child(div_5);
		var text_4 = $.only_child(span, true);
		var small = $.sibling(span, 2);
		var text_5 = $.only_child(small, true);

		$.reset(div_5);
		$.reset(label);
		$.action(label, ($$node, $$action_arg) => tooltip?.($$node, $$action_arg), () => option().description);

		$.template_effect(() => {
			$.set_checked(input, option().enabled);
			$.set_attribute(input, 'aria-describedby', `a11y-${option().id ?? ''}-desc`);
			$.set_text(text_4, option().name);
			$.set_attribute(small, 'id', `a11y-${option().id ?? ''}-desc`);
			$.set_text(text_5, option().description);
		});

		$.delegated('change', input, () => handlers.a11yToggle(option().id));
		$.append($$anchor, label);
	};

	const themeButton = ($$anchor, themeOption = $.noop) => {
		var button_2 = root_6();
		let classes;
		var div_6 = $.child(button_2);
		var span_1 = $.sibling(div_6, 2);
		var text_6 = $.only_child(span_1);

		$.reset(button_2);

		$.template_effect(() => {
			classes = $.set_class(button_2, 1, 'theme-option svelte-feb5js', null, classes, {
				active: $currentTheme() === themeOption().id,
				disabled: !themeOption().available
			});

			$.set_attribute(button_2, 'aria-checked', $currentTheme() === themeOption().id);
			button_2.disabled = !themeOption().available;
			$.set_style(div_6, `background: ${(themeOption().preview || 'var(--bg-secondary)') ?? ''}`);

			$.set_text(text_6, `${themeOption().name ?? ''}
      ${!themeOption().available ? ' (Soon)' : ''}`);
		});

		$.delegated('click', button_2, () => handlers.themeChange(themeOption().id));
		$.append($$anchor, button_2);
	};

	let standalone = $.prop($$props, 'standalone', 3, false);
	let showMoreA11y = $.state($.proxy(standalone()));
	let showMoreThemes = $.state($.proxy(standalone()));
	let showCustomColorInput = $.state(false);
	let selectedLanguage = $.state('en');
	let accessibilitySettings = $.proxy(accessibility);
	let currentTheme = $.proxy(theme);
	let currentNavbarDisplay = $.proxy(navbarDisplay);
	let currentHomepageLayout = $.proxy(homepageLayout);
	let currentCustomCss = $.proxy(customCss);
	let currentFontScale = $.proxy(fontScale);
	let cssInput = $.state('');
	let siteTitleInput = $.state('');
	let siteDescriptionInput = $.state('');
	let siteIconUrlInput = $.state('');
	let primaryColorInput = $.state('');
	let validationErrors = $.state($.proxy([]));
	let validationWarnings = $.state($.proxy([]));
	let siteCustomizationErrors = $.state($.proxy([]));
	let lastStoreValue = $.state('');
	let lastColorStoreValue = $.state('');
	let envVarsCopied = $.state(false);
	let envFormat = $.state('env');
	let showExportSettings = $.state(false);
	let showExportStyles = $.state(false);
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

	const primaryOptions = $.derived(() => $accessibilitySettings().options.filter((opt) => PRIMARY_A11Y_OPTIONS.includes(opt.id)));
	const additionalOptions = $.derived(() => $accessibilitySettings().options.filter((opt) => !PRIMARY_A11Y_OPTIONS.includes(opt.id)));

	$.user_effect(() => {
		if ($currentCustomCss() !== $.get(lastStoreValue)) {
			$.set(cssInput, $currentCustomCss(), true);
			$.set(lastStoreValue, $currentCustomCss(), true);
		}
	});

	$.user_effect(() => {
		$.set(siteTitleInput, $siteCustomization().title, true);
		$.set(siteDescriptionInput, $siteCustomization().description, true);
		$.set(siteIconUrlInput, $siteCustomization().iconUrl, true);
	});

	$.user_effect(() => {
		if ($primaryColor() !== $.get(lastColorStoreValue)) {
			$.set(primaryColorInput, $primaryColor(), true);
			$.set(lastColorStoreValue, $primaryColor(), true);
		}
	});

	$.user_effect(() => {
		const trimmed = $.get(primaryColorInput).trim();

		if (trimmed && trimmed !== $primaryColor()) {
			primaryColor.set(trimmed);
			$.set(lastColorStoreValue, trimmed, true);
		} else if (!trimmed && $primaryColor()) {
			primaryColor.clear();
			$.set(lastColorStoreValue, '');
		}
	});

	// Event handlers
	const handlers = {
		themeChange: (themeId) => theme.setTheme(themeId),
		a11yToggle: (optionId) => accessibility.toggle(optionId),
		navbarChange: (e) => navbarDisplay.setMode(e.currentTarget.value),
		homepageChange: (e) => homepageLayout.setMode(e.currentTarget.value),
		fontScaleChange: (e) => fontScale.setLevel(parseInt(e.currentTarget.value, 10)),
		linkClick: () => $$props.onClose?.(),
		applyCustomCss: () => {
			const validation = customCss.validate($.get(cssInput));

			$.set(validationErrors, validation.errors, true);
			$.set(validationWarnings, validation.warnings, true);

			if (validation.isValid) customCss.set($.get(cssInput));
		},

		clearCustomCss: () => {
			$.set(cssInput, '');
			customCss.clear();
			$.set(validationErrors, [], true);
			$.set(validationWarnings, [], true);
		},

		applySiteCustomization: () => {
			const data = {
				title: $.get(siteTitleInput).trim(),
				description: $.get(siteDescriptionInput).trim(),
				iconUrl: $.get(siteIconUrlInput).trim()
			};

			const validation = siteCustomization.validate(data);

			$.set(siteCustomizationErrors, validation.errors, true);

			if (validation.isValid) {
				siteCustomization.set(data);
				window.location.reload();
			}
		},

		clearSiteCustomization: () => {
			siteCustomization.clear();
			$.set(siteCustomizationErrors, [], true);
			window.location.reload();
		},

		resetColor: () => {
			$.set(primaryColorInput, '');
		},

		clearAllData: () => {
			if (window.confirm('Your theme, language, home and nav layout, site branding, accessibility preferences, custom CSS and all other settings will be discarded. This will also clear your bookmarks, recent tools and other history. Are you sure you want to proceed?')) {
				storage.clear();
				window.location.reload();
			}
		},

		copyEnvVars: async () => {
			try {
				await navigator.clipboard.writeText($.get(envVarsString));
				$.set(envVarsCopied, true);
				setTimeout(() => $.set(envVarsCopied, false), 2000);
			} catch {
				const textArea = document.createElement('textarea');

				textArea.value = $.get(envVarsString);
				document.body.appendChild(textArea);
				textArea.select();
				document.execCommand('copy');
				document.body.removeChild(textArea);
				$.set(envVarsCopied, true);
				setTimeout(() => $.set(envVarsCopied, false), 2000);
			}
		}
	};

	// Live-updating env vars string - reacts to store changes
	const envVarsString = $.derived(() => {
		// Trigger reactivity on store changes
		void $currentTheme();

		void $currentFontScale();
		void $currentHomepageLayout();
		void $currentNavbarDisplay();
		void $primaryColor();
		void $siteCustomization();

		const envVars = config.getUserSettingsList();

		if ($.get(envFormat) === 'docker') {
			const filtered = envVars.filter(({ value }) => value !== '');

			return 'environment:\n' + filtered.map(({ name, value }) => `  - ${name}=${value}`).join('\n');
		}

		return envVars.map(({ name, value }) => `${name}='${value}'`).join('\n');
	});

	var div_7 = root_23();
	let classes_1;
	var div_8 = $.child(div_7);
	var div_9 = $.sibling($.child(div_8), 2);
	var node_6 = $.child(div_9);

	$.each(node_6, 17, () => themes.slice(0, 6), (themeOption) => themeOption.id, ($$anchor, themeOption) => {
		themeButton($$anchor, () => $.get(themeOption));
	});

	var node_7 = $.sibling(node_6, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_10 = root_7();

			$.each(div_10, 21, () => themes.slice(6), (themeOption) => themeOption.id, ($$anchor, themeOption) => {
				themeButton($$anchor, () => $.get(themeOption));
			});

			$.reset(div_10);
			$.transition(3, div_10, () => slide, () => ({ duration: 300 }));
			$.append($$anchor, div_10);
		};

		$.if(node_7, ($$render) => {
			if ($.get(showMoreThemes) && themes.length > 6) $$render(consequent_2);
		});
	}

	$.reset(div_9);

	var node_8 = $.sibling(div_9, 2);

	{
		var consequent_3 = ($$anchor) => {
			var button_3 = root_8();
			var node_9 = $.child(button_3);

			{
				let $0 = $.derived(() => $.get(showMoreThemes) ? 'chevron-up' : 'chevron-down');

				Icon(node_9, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var span_2 = $.sibling(node_9, 2);
			var text_7 = $.only_child(span_2, true);

			$.reset(button_3);

			$.template_effect(() => {
				$.set_attribute(button_3, 'aria-expanded', $.get(showMoreThemes));
				$.set_text(text_7, $.get(showMoreThemes) ? 'Show less' : 'Show more themes');
			});

			$.delegated('click', button_3, () => $.set(showMoreThemes, !$.get(showMoreThemes)));
			$.append($$anchor, button_3);
		};

		$.if(node_8, ($$render) => {
			if (themes.length > 6 && !standalone()) $$render(consequent_3);
		});
	}

	$.reset(div_8);

	var node_10 = $.sibling(div_8, 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_11 = root_10();
			var div_12 = $.sibling($.child(div_11), 2);
			var input_1 = $.child(div_12);

			$.remove_input_defaults(input_1);

			var div_13 = $.sibling(input_1, 2);

			$.each(div_13, 21, () => fontScaleOptions, (option) => option.level, ($$anchor, option) => {
				var span_3 = root_9();
				let classes_2;
				var text_8 = $.only_child(span_3, true);

				$.template_effect(() => {
					classes_2 = $.set_class(span_3, 1, 'slider-label svelte-feb5js', null, classes_2, { active: $currentFontScale() === $.get(option).level });
					$.set_text(text_8, $.get(option).label);
				});

				$.append($$anchor, span_3);
			});

			$.reset(div_13);
			$.reset(div_12);
			$.reset(div_11);
			$.template_effect(() => $.set_value(input_1, $currentFontScale()));

			$.delegated('input', input_1, function (...$$args) {
				handlers.fontScaleChange?.apply(this, $$args);
			});

			$.append($$anchor, div_11);
		};

		$.if(node_10, ($$render) => {
			if (standalone()) $$render(consequent_4);
		});
	}

	var div_14 = $.sibling(node_10, 2);
	var div_15 = $.sibling($.child(div_14), 2);

	$.each(div_15, 21, () => LANGUAGES, (lang) => lang.code, ($$anchor, lang) => {
		var button_4 = root_11();
		let classes_3;
		var text_9 = $.only_child(button_4);

		$.template_effect(() => {
			classes_3 = $.set_class(button_4, 1, 'language-option svelte-feb5js', null, classes_3, {
				active: $.get(selectedLanguage) === $.get(lang).code,
				disabled: !$.get(lang).available
			});

			button_4.disabled = !$.get(lang).available;

			$.set_text(text_9, `${$.get(lang).flag ?? ''}
          ${$.get(lang).name ?? ''}`);
		});

		$.delegated('click', button_4, () => $.set(selectedLanguage, $.get(lang).code, true));
		$.append($$anchor, button_4);
	});

	$.reset(div_15);
	$.reset(div_14);

	var div_16 = $.sibling(div_14, 2);
	var div_17 = $.sibling($.child(div_16), 2);
	var select = $.child(div_17);

	$.each(select, 21, () => homepageLayoutOptions, (option) => option.id, ($$anchor, option) => {
		var option_1 = root_12();
		var text_10 = $.only_child(option_1, true);
		var option_1_value = {};

		$.template_effect(() => {
			$.set_text(text_10, $.get(option).name);

			if (option_1_value !== (option_1_value = $.get(option).id)) {
				option_1.value = (option_1.__value = option_1_value) ?? '';
			}
		});

		$.append($$anchor, option_1);
	});

	$.reset(select);

	var select_value;

	$.init_select(select);

	var div_18 = $.sibling(select, 2);
	var node_11 = $.child(div_18);

	Icon(node_11, { name: 'chevron-down', size: 'xs' });
	$.reset(div_18);
	$.reset(div_17);

	var small_1 = $.sibling(div_17, 2);
	var text_11 = $.only_child(small_1, true);

	$.reset(div_16);

	var div_19 = $.sibling(div_16, 2);
	var div_20 = $.sibling($.child(div_19), 2);
	var select_1 = $.child(div_20);

	$.each(select_1, 21, () => navbarDisplayOptions, (option) => option.id, ($$anchor, option) => {
		var option_2 = root_12();
		var text_12 = $.only_child(option_2, true);
		var option_2_value = {};

		$.template_effect(() => {
			$.set_text(text_12, $.get(option).name);

			if (option_2_value !== (option_2_value = $.get(option).id)) {
				option_2.value = (option_2.__value = option_2_value) ?? '';
			}
		});

		$.append($$anchor, option_2);
	});

	$.reset(select_1);

	var select_1_value;

	$.init_select(select_1);

	var div_21 = $.sibling(select_1, 2);
	var node_12 = $.child(div_21);

	Icon(node_12, { name: 'chevron-down', size: 'xs' });
	$.reset(div_21);
	$.reset(div_20);

	var small_2 = $.sibling(div_20, 2);
	var text_13 = $.only_child(small_2, true);

	$.reset(div_19);

	var div_22 = $.sibling(div_19, 2);
	var div_23 = $.sibling($.child(div_22), 2);
	var node_13 = $.child(div_23);

	$.each(node_13, 17, () => $.get(primaryOptions), (option) => option.id, ($$anchor, option) => {
		accessibilityOption($$anchor, () => $.get(option));
	});

	var node_14 = $.sibling(node_13, 2);

	{
		var consequent_5 = ($$anchor) => {
			var div_24 = root_13();

			$.each(div_24, 21, () => $.get(additionalOptions), (option) => option.id, ($$anchor, option) => {
				accessibilityOption($$anchor, () => $.get(option));
			});

			$.reset(div_24);
			$.transition(3, div_24, () => slide, () => ({ duration: 300 }));
			$.append($$anchor, div_24);
		};

		$.if(node_14, ($$render) => {
			if ($.get(showMoreA11y)) $$render(consequent_5);
		});
	}

	var node_15 = $.sibling(node_14, 2);

	{
		var consequent_6 = ($$anchor) => {
			var button_5 = root_8();
			var node_16 = $.child(button_5);

			{
				let $0 = $.derived(() => $.get(showMoreA11y) ? 'chevron-up' : 'chevron-down');

				Icon(node_16, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			var span_4 = $.sibling(node_16, 2);
			var text_14 = $.only_child(span_4, true);

			$.reset(button_5);

			$.template_effect(() => {
				$.set_attribute(button_5, 'aria-expanded', $.get(showMoreA11y));
				$.set_text(text_14, $.get(showMoreA11y) ? 'Show less' : 'Show all a11y options');
			});

			$.delegated('click', button_5, () => $.set(showMoreA11y, !$.get(showMoreA11y)));
			$.append($$anchor, button_5);
		};

		$.if(node_15, ($$render) => {
			if (!standalone()) $$render(consequent_6);
		});
	}

	$.reset(div_23);
	$.reset(div_22);

	var node_17 = $.sibling(div_22, 2);

	{
		var consequent_8 = ($$anchor) => {
			var fragment_5 = root_16();
			var div_25 = $.first_child(fragment_5);
			var div_26 = $.sibling($.child(div_25), 4);
			var input_2 = $.sibling($.child(div_26), 2);

			$.remove_input_defaults(input_2);
			$.reset(div_26);

			var div_27 = $.sibling(div_26, 2);
			var input_3 = $.sibling($.child(div_27), 2);

			$.remove_input_defaults(input_3);
			$.reset(div_27);

			var div_28 = $.sibling(div_27, 2);
			var input_4 = $.sibling($.child(div_28), 2);

			$.remove_input_defaults(input_4);
			$.reset(div_28);

			var node_18 = $.sibling(div_28, 2);

			validationMessages(node_18, () => $.get(siteCustomizationErrors), () => []);

			var node_19 = $.sibling(node_18, 2);

			actionButtons(node_19, () => handlers.applySiteCustomization, () => handlers.clearSiteCustomization, () => 'Apply', () => 'Reset');
			$.reset(div_25);

			var div_29 = $.sibling(div_25, 2);
			var div_30 = $.sibling($.child(div_29), 4);

			$.each(div_30, 20, () => COLOR_PALETTE, (color) => color, ($$anchor, color) => {
				var button_6 = root_14();
				let classes_4;

				$.template_effect(() => {
					classes_4 = $.set_class(button_6, 1, 'color-swatch svelte-feb5js', null, classes_4, { active: $.get(primaryColorInput) === color });
					$.set_style(button_6, `background-color: ${color ?? ''};`);
					$.set_attribute(button_6, 'aria-label', `Select color ${color ?? ''}`);
				});

				$.delegated('click', button_6, () => $.set(primaryColorInput, color, true));
				$.append($$anchor, button_6);
			});

			$.reset(div_30);

			var div_31 = $.sibling(div_30, 2);
			var button_7 = $.child(div_31);
			var node_20 = $.child(button_7);

			Icon(node_20, { name: 'palette', size: 'sm' });
			$.next();
			$.reset(button_7);

			var button_8 = $.sibling(button_7, 2);
			var node_21 = $.child(button_8);

			Icon(node_21, { name: 'undo', size: 'sm' });
			$.next();
			$.reset(button_8);
			$.reset(div_31);

			var node_22 = $.sibling(div_31, 2);

			{
				var consequent_7 = ($$anchor) => {
					var div_32 = root_15();
					var div_33 = $.child(div_32);
					var input_5 = $.sibling($.child(div_33), 2);

					$.remove_input_defaults(input_5);
					$.reset(div_33);

					var div_34 = $.sibling(div_33, 2);
					var input_6 = $.sibling($.child(div_34), 2);

					$.remove_input_defaults(input_6);
					$.reset(div_34);
					$.reset(div_32);
					$.bind_value(input_5, () => $.get(primaryColorInput), ($$value) => $.set(primaryColorInput, $$value));
					$.bind_value(input_6, () => $.get(primaryColorInput), ($$value) => $.set(primaryColorInput, $$value));
					$.transition(3, div_32, () => slide, () => ({ duration: 200 }));
					$.append($$anchor, div_32);
				};

				$.if(node_22, ($$render) => {
					if ($.get(showCustomColorInput)) $$render(consequent_7);
				});
			}

			$.reset(div_29);

			var div_35 = $.sibling(div_29, 2);
			var textarea = $.sibling($.child(div_35), 4);

			$.remove_textarea_child(textarea);

			var div_36 = $.sibling(textarea, 2);
			var span_5 = $.child(div_36);
			var text_15 = $.only_child(span_5);

			$.reset(div_36);

			var node_23 = $.sibling(div_36, 2);

			validationMessages(node_23, () => $.get(validationErrors), () => $.get(validationWarnings));

			var node_24 = $.sibling(node_23, 2);

			actionButtons(node_24, () => handlers.applyCustomCss, () => handlers.clearCustomCss);
			$.reset(div_35);
			$.template_effect(() => $.set_text(text_15, `${$.get(cssInput).length ?? ''} characters`));
			$.bind_value(input_2, () => $.get(siteTitleInput), ($$value) => $.set(siteTitleInput, $$value));
			$.bind_value(input_3, () => $.get(siteDescriptionInput), ($$value) => $.set(siteDescriptionInput, $$value));
			$.bind_value(input_4, () => $.get(siteIconUrlInput), ($$value) => $.set(siteIconUrlInput, $$value));
			$.delegated('click', button_7, () => $.set(showCustomColorInput, !$.get(showCustomColorInput)));

			$.delegated('click', button_8, function (...$$args) {
				handlers.resetColor?.apply(this, $$args);
			});

			$.bind_value(textarea, () => $.get(cssInput), ($$value) => $.set(cssInput, $$value));
			$.append($$anchor, fragment_5);
		};

		$.if(node_17, ($$render) => {
			if (standalone()) $$render(consequent_8);
		});
	}

	var node_25 = $.sibling(node_17, 2);

	{
		var consequent_9 = ($$anchor) => {
			var div_37 = root_17();

			$.append($$anchor, div_37);
		};

		$.if(node_25, ($$render) => {
			if (standalone()) $$render(consequent_9);
		});
	}

	var node_26 = $.sibling(node_25, 2);

	{
		var consequent_10 = ($$anchor) => {
			var div_38 = root_18();
			var div_39 = $.sibling($.child(div_38), 2);
			var node_27 = $.child(div_39);

			Icon(node_27, { name: 'alert-triangle', size: 'sm' });
			$.next(2);
			$.reset(div_39);

			var button_9 = $.sibling(div_39, 2);
			var node_28 = $.child(button_9);

			Icon(node_28, { name: 'trash', size: 'sm' });
			$.next();
			$.reset(button_9);
			$.reset(div_38);

			$.delegated('click', button_9, function (...$$args) {
				handlers.clearAllData?.apply(this, $$args);
			});

			$.append($$anchor, div_38);
		};

		$.if(node_26, ($$render) => {
			if (standalone()) $$render(consequent_10);
		});
	}

	var node_29 = $.sibling(node_26, 2);

	{
		var consequent_13 = ($$anchor) => {
			var div_40 = root_21();
			var button_10 = $.sibling($.child(div_40), 6);
			var node_30 = $.child(button_10);

			{
				let $0 = $.derived(() => $.get(showExportSettings) ? 'chevron-up' : 'chevron-down');

				Icon(node_30, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			$.next(2);
			$.reset(button_10);

			var node_31 = $.sibling(button_10, 2);

			{
				var consequent_11 = ($$anchor) => {
					var div_41 = root_19();
					var div_42 = $.child(div_41);
					var node_32 = $.sibling($.child(div_42), 2);

					SegmentedControl(node_32, {
						options: [
							{ value: 'env', label: '.env' },
							{ value: 'docker', label: 'docker-compose' }
						],

						get value() {
							return $.get(envFormat);
						},

						set value($$value) {
							$.set(envFormat, $$value, true);
						}
					});

					$.reset(div_42);

					var pre = $.sibling(div_42, 4);
					var code = $.child(pre);
					var text_16 = $.only_child(code, true);

					$.reset(pre);

					var button_11 = $.sibling(pre, 2);
					var node_33 = $.child(button_11);

					{
						let $0 = $.derived(() => $.get(envVarsCopied) ? 'check' : 'copy');

						Icon(node_33, {
							get name() {
								return $.get($0);
							},
							size: 'sm'
						});
					}

					var text_17 = $.sibling(node_33);

					$.reset(button_11);
					$.reset(div_41);

					$.template_effect(() => {
						$.set_text(text_16, $.get(envVarsString));
						$.set_text(text_17, ` ${$.get(envVarsCopied) ? 'Copied!' : 'Copy to Clipboard'}`);
					});

					$.delegated('click', button_11, function (...$$args) {
						handlers.copyEnvVars?.apply(this, $$args);
					});

					$.transition(3, div_41, () => slide, () => ({ duration: 300 }));
					$.append($$anchor, div_41);
				};

				$.if(node_31, ($$render) => {
					if ($.get(showExportSettings)) $$render(consequent_11);
				});
			}

			var button_12 = $.sibling(node_31, 2);
			var node_34 = $.child(button_12);

			{
				let $0 = $.derived(() => $.get(showExportStyles) ? 'chevron-up' : 'chevron-down');

				Icon(node_34, {
					get name() {
						return $.get($0);
					},
					size: 'sm'
				});
			}

			$.next(2);
			$.reset(button_12);

			var node_35 = $.sibling(button_12, 2);

			{
				var consequent_12 = ($$anchor) => {
					var div_43 = root_20();
					var div_44 = $.sibling($.child(div_43), 4);
					var pre_1 = $.sibling($.child(div_44), 4);
					var code_1 = $.child(pre_1);
					var text_18 = $.only_child(code_1, true);

					$.reset(pre_1);

					var div_45 = $.sibling(pre_1, 4);
					var pre_2 = $.sibling($.child(div_45), 10);
					var code_2 = $.child(pre_2);
					var text_19 = $.only_child(code_2);

					$.reset(pre_2);
					$.reset(div_45);

					var div_46 = $.sibling(div_45, 2);
					var node_36 = $.child(div_46);

					Icon(node_36, { name: 'info', size: 'sm' });
					$.next(2);
					$.reset(div_46);
					$.reset(div_44);
					$.reset(div_43);

					$.template_effect(() => {
						$.set_text(text_18, $currentCustomCss() || '/* No custom CSS saved yet */\n/* Add your custom styles in the Custom CSS section above */');

						$.set_text(text_19, `docker exec -it <container-name> sh -c 'cat > /app/static/custom-styles.css << "EOF"
${($currentCustomCss() || '/* Your custom CSS here */') ?? ''}
EOF'`);
					});

					$.transition(3, div_43, () => slide, () => ({ duration: 300 }));
					$.append($$anchor, div_43);
				};

				$.if(node_35, ($$render) => {
					if ($.get(showExportStyles)) $$render(consequent_12);
				});
			}

			$.reset(div_40);

			$.template_effect(() => {
				$.set_attribute(button_10, 'aria-expanded', $.get(showExportSettings));
				$.set_attribute(button_12, 'aria-expanded', $.get(showExportStyles));
			});

			$.delegated('click', button_10, () => $.set(showExportSettings, !$.get(showExportSettings)));
			$.delegated('click', button_12, () => $.set(showExportStyles, !$.get(showExportStyles)));
			$.append($$anchor, div_40);
		};

		$.if(node_29, ($$render) => {
			if (standalone()) $$render(consequent_13);
		});
	}

	var node_37 = $.sibling(node_29, 2);

	{
		var consequent_14 = ($$anchor) => {
			var div_47 = root_22();
			var a = $.child(div_47);
			var node_38 = $.child(a);

			Icon(node_38, { name: 'settings', size: 'sm' });
			$.next(2);
			$.reset(a);
			$.reset(div_47);

			$.delegated('click', a, function (...$$args) {
				handlers.linkClick?.apply(this, $$args);
			});

			$.append($$anchor, div_47);
		};

		$.if(node_37, ($$render) => {
			if (!standalone()) $$render(consequent_14);
		});
	}

	$.reset(div_7);

	$.template_effect(
		($0, $1) => {
			classes_1 = $.set_class(div_7, 1, 'settings-panel svelte-feb5js', null, classes_1, { standalone: standalone() });

			if (select_value !== (select_value = $currentHomepageLayout())) {
				(
					select.value = (select.__value = select_value) ?? '',
					$.select_option(select, select_value)
				);
			}

			$.set_text(text_11, $0);

			if (select_1_value !== (select_1_value = $currentNavbarDisplay())) {
				(
					select_1.value = (select_1.__value = select_1_value) ?? '',
					$.select_option(select_1, select_1_value)
				);
			}

			$.set_text(text_13, $1);
		},
		[
			() => homepageLayoutOptions.find((opt) => opt.id === $currentHomepageLayout())?.description,
			() => navbarDisplayOptions.find((opt) => opt.id === $currentNavbarDisplay())?.description
		]
	);

	$.delegated('change', select, function (...$$args) {
		handlers.homepageChange?.apply(this, $$args);
	});

	$.delegated('change', select_1, function (...$$args) {
		handlers.navbarChange?.apply(this, $$args);
	});

	$.append($$anchor, div_7);
	$.pop();
	$$cleanup();
}

$.delegate(['click', 'change', 'input']);