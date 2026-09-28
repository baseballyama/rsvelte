import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { fade } from 'svelte/transition';
import { createSelect, melt } from '@melt-ui/svelte';
import { browser } from '$app/environment';
import { preferences } from './preferences.svelte';

var root = $.from_html(`<div class="svelte-6ji32x"> </div>`);
var root_1 = $.from_html(`<div class="menu svelte-6ji32x"></div>`);
var root_2 = $.from_html(`<div class="select"><label>Theme</label> <button class="trigger svelte-6ji32x" aria-label="Theme"> </button> <!></div>`);

export default function Themes($$anchor, $$props) {
	$.push($$props, true);

	const $selectedLabel = () => $.store_get(selectedLabel, '$selectedLabel', $$stores);
	const $label = () => $.store_get(label, '$label', $$stores);
	const $trigger = () => $.store_get(trigger, '$trigger', $$stores);
	const $open = () => $.store_get(open, '$open', $$stores);
	const $menu = () => $.store_get(menu, '$menu', $$stores);
	const $option = () => $.store_get(option, '$option', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

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

	$.user_effect(() => {
		updateTheme($selectedLabel());
	});

	$.user_effect(() => {
		preferences.resetTheme;
		selected.set({ value: '🌛 Night', label: '🌛 Night' });
	});

	var div = root_2();
	var label_1 = $.child(div);

	$.action(label_1, ($$node, $$action_arg) => melt?.($$node, $$action_arg), $label);

	var button = $.sibling(label_1, 2);
	var text = $.only_child(button, true);

	$.action(button, ($$node, $$action_arg) => melt?.($$node, $$action_arg), $trigger);

	var node = $.sibling(button, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root_1();

			$.each(div_1, 21, () => Object.entries(themes), ([key, theme]) => key, ($$anchor, $$item) => {
				var $$array = $.derived(() => $.to_array($.get($$item), 2));
				let key = () => $.get($$array)[0];
				let theme = () => $.get($$array)[1];
				var div_2 = root();
				var text_1 = $.only_child(div_2, true);

				$.action(div_2, ($$node, $$action_arg) => melt?.($$node, $$action_arg), () => $option()({ value: theme().name, label: theme().name }));
				$.template_effect(() => $.set_text(text_1, theme().name));
				$.append($$anchor, div_2);
			});

			$.reset(div_1);
			$.action(div_1, ($$node, $$action_arg) => melt?.($$node, $$action_arg), $menu);
			$.transition(3, div_1, () => fade, () => ({ duration: 100 }));
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($open()) $$render(consequent);
		});
	}

	$.reset(div);
	$.template_effect(() => $.set_text(text, $selectedLabel() || selectedTheme.name));
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}