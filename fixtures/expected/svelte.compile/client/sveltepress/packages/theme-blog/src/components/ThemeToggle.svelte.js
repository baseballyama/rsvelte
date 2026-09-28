import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`);
var root_1 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`);
var root_2 = $.from_html(`<button class="sp-theme-toggle svelte-1m0y0gq"><!></button>`);

export default function ThemeToggle($$anchor, $$props) {
	$.push($$props, true);

	let theme = $.state('dark');

	$.user_effect(() => {
		// Read the value set by the anti-FOWT inline script
		const current = document.documentElement.dataset.theme;

		$.set(theme, current ?? 'dark', true);

		// Follow OS preference changes when the user hasn't manually chosen
		const mq = window.matchMedia('(prefers-color-scheme: dark)');

		function onOsChange(e) {
			if (!localStorage.getItem('sp-blog-theme')) {
				$.set(theme, e.matches ? 'dark' : 'light', true);
				document.documentElement.dataset.theme = $.get(theme);
			}
		}

		mq.addEventListener('change', onOsChange);

		return () => mq.removeEventListener('change', onOsChange);
	});

	function toggle() {
		$.set(theme, $.get(theme) === 'dark' ? 'light' : 'dark', true);
		document.documentElement.dataset.theme = $.get(theme);
		localStorage.setItem('sp-blog-theme', $.get(theme));
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

	$.template_effect(() => {
		$.set_attribute(button, 'aria-label', $.get(theme) === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
		$.set_attribute(button, 'title', $.get(theme) === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
	});

	$.delegated('click', button, toggle);
	$.append($$anchor, button);
	$.pop();
}

$.delegate(['click']);