import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';
import { createSelect, melt } from '@melt-ui/svelte';
import { browser } from '$app/environment';
import { preferences } from './preferences.svelte';

export default function Themes($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;

		function getTheme() {
			if (!browser) return;

			const html = document.documentElement;
			const userTheme = localStorage.theme;
			const prefersDarkMode = window.matchMedia('prefers-color-scheme: dark').matches;
			const prefersLightMode = window.matchMedia('prefers-color-scheme: light').matches;

			// check if the user set a theme
			if (userTheme) {
				html.dataset.theme = userTheme;

				return themes[userTheme];
			}

			// otherwise check for user preference
			if (!userTheme && prefersDarkMode) {
				html.dataset.theme = '🌛 Night';
				localStorage.theme = '🌛 Night';
			}

			if (!userTheme && prefersLightMode) {
				html.dataset.theme = '☀️ Daylight';
				localStorage.theme = '☀️ Daylight';
			}

			// if nothing is set default to dark mode
			if (!userTheme && !prefersDarkMode && !prefersLightMode) {
				html.dataset.theme = '🌛 Night';
				localStorage.theme = '🌛 Night';
			}

			return themes[userTheme];
		}

		function updateTheme(theme) {
			if (!browser || !theme) return;

			const htmlElement = document.documentElement;

			htmlElement.dataset.theme = theme;
			localStorage.theme = theme;
		}

		const themes = {
			'🌛 Night': { name: '🌛 Night' },
			'☀️ Daylight': { name: '☀️ Daylight' },
			'🐺 Night Howl': { name: '🐺 Night Howl' },
			'🧠 Night Mind': { name: '🧠 Night Mind' }
		};

		const selectedTheme = getTheme() ?? themes['🌛 Night'];

		const {
			elements: { trigger, menu, option, label },
			states: { open, selected, selectedLabel }
		} = createSelect();

		$$renderer.push(`<div class="select"><label>Theme</label> <button class="trigger svelte-6ji32x" aria-label="Theme">${$.escape($.store_get($$store_subs ??= {}, '$selectedLabel', selectedLabel) || selectedTheme.name)}</button> `);

		if ($.store_get($$store_subs ??= {}, '$open', open)) {
			$$renderer.push(`<!--[0--><div class="menu svelte-6ji32x"><!--[-->`);

			const each_array = $.ensure_array_like(Object.entries(themes));

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let [key, theme] = each_array[$$index];

				$$renderer.push(`<div class="svelte-6ji32x">${$.escape(theme.name)}</div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}