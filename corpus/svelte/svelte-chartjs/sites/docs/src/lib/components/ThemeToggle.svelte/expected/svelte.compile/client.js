import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`);
var root_1 = $.from_svg(`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`);
var root_2 = $.from_html(`<button class="theme-toggle svelte-8xukvy" aria-label="Toggle theme"><!></button>`);

export default function ThemeToggle($$anchor, $$props) {
	$.push($$props, true);

	let theme = $.state('light');

	function getSystemTheme() {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	function applyTheme(t) {
		$.set(theme, t, true);
		document.documentElement.setAttribute('data-theme', t);
	}

	$.user_effect(() => {
		const saved = localStorage.getItem('theme');

		if (saved === 'light' || saved === 'dark') {
			$.set(theme, saved, true);
		} else {
			$.set(theme, getSystemTheme(), true);
		}
	});

	function toggle() {
		const next = $.get(theme) === 'dark' ? 'light' : 'dark';

		applyTheme(next);
		localStorage.setItem('theme', next);
	}

	var button = root_2();
	var node = $.child(button);

	{
		var consequent = ($$anchor) => {
			var svg = root();

			$.append($$anchor, svg);
		};

		var alternate = ($$anchor) => {
			var svg_1 = root_1();

			$.append($$anchor, svg_1);
		};

		$.if(node, ($$render) => {
			if ($.get(theme) === 'dark') $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);
	$.delegated('click', button, toggle);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);