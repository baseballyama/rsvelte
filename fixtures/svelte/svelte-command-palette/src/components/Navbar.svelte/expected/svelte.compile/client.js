import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/stores';
import switchTheme from '../utils/switchTheme';

var root = $.from_svg(`<path d="M18 6L6 18M6 6l12 12"></path>`);
var root_1 = $.from_svg(`<path d="M4 6h16M4 12h16M4 18h16"></path>`);
var root_2 = $.from_html(`<nav class="navbar svelte-d8j1hi"><div class="navbar-container svelte-d8j1hi"><a href="/" class="navbar-brand svelte-d8j1hi"><svg width="28" height="28" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" class="svelte-d8j1hi"><path d="M239.03 38.97C230.63 30.57 219.43 26 207.62 26H48.38C24.11 26 4.38 45.73 4.38 70V186C4.38 210.27 24.11 230 48.38 230H207.62C231.89 230 251.62 210.27 251.62 186V70C251.62 58.19 247.05 46.99 238.65 38.59L239.03 38.97ZM195.92 137.06L147.42 206.06C145.66 208.56 142.81 210.06 139.77 210.06C139.21 210.06 138.64 210.02 138.08 209.93C134.49 209.38 131.46 206.99 130.08 203.64L113.54 166.27L75.39 182.27C71.72 183.81 67.54 183.06 64.61 180.35C61.68 177.64 60.58 173.53 61.79 169.74L93.79 71.74C95.13 67.63 98.91 64.72 103.22 64.47C107.53 64.22 111.59 66.67 113.42 70.56L147.42 144.56L189.23 85.06C191.93 81.22 197.01 80.03 201.1 82.33C205.19 84.63 206.91 89.55 205.04 93.86L195.92 137.06Z" fill="currentColor"></path></svg> <span>Svelte Command Palette</span></a> <button class="navbar-toggle svelte-d8j1hi" aria-label="Toggle menu"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><!></svg></button> <div><a href="/docs">Documentation</a> <a href="https://github.com/rohitpotato/svelte-command-palette" target="_blank" rel="noopener" class="navbar-link svelte-d8j1hi">GitHub</a> <button class="navbar-theme-toggle svelte-d8j1hi" aria-label="Toggle theme"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg></button> <a href="/docs" class="btn btn-primary navbar-cta svelte-d8j1hi">Get Started</a></div></div></nav>`);

export default function Navbar($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let isMenuOpen = $.state(false);

	const toggleMenu = () => {
		$.set(isMenuOpen, !$.get(isMenuOpen));
	};

	const closeMenu = () => {
		$.set(isMenuOpen, false);
	};

	var nav = root_2();
	var div = $.child(nav);
	var button = $.sibling($.child(div), 2);
	var svg = $.child(button);
	var node = $.child(svg);

	{
		var consequent = ($$anchor) => {
			var path = root();

			$.append($$anchor, path);
		};

		var alternate = ($$anchor) => {
			var path_1 = root_1();

			$.append($$anchor, path_1);
		};

		$.if(node, ($$render) => {
			if ($.get(isMenuOpen)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(svg);
	$.reset(button);

	var div_1 = $.sibling(button, 2);
	let classes;
	var a = $.child(div_1);
	let classes_1;
	var a_1 = $.sibling(a, 2);
	var button_1 = $.sibling(a_1, 2);
	var a_2 = $.sibling(button_1, 2);

	$.reset(div_1);
	$.reset(div);
	$.reset(nav);

	$.template_effect(
		($0) => {
			classes = $.set_class(div_1, 1, 'navbar-menu svelte-d8j1hi', null, classes, { active: $.get(isMenuOpen) });
			classes_1 = $.set_class(a, 1, 'navbar-link svelte-d8j1hi', null, classes_1, { active: $0 });
		},
		[() => $page().url.pathname.startsWith('/docs')]
	);

	$.delegated('click', button, toggleMenu);
	$.delegated('click', a, closeMenu);
	$.delegated('click', a_1, closeMenu);

	$.delegated('click', button_1, function (...$$args) {
		switchTheme?.apply(this, $$args);
	});

	$.delegated('click', a_2, closeMenu);
	$.append($$anchor, nav);
	$.pop();
	$$cleanup();
}

$.delegate(['click']);