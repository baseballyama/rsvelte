import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import { onMount } from 'svelte';
import themeOptions from 'virtual:sveltepress/theme-default';
import Discord from './icons/Discord.svelte';
import Github from './icons/Github.svelte';
import { scrollDirection } from './layout';
import Logo from './Logo.svelte';
import MobileSubNav from './MobileSubNav.svelte';
import NavbarMobile from './NavbarMobile.svelte';
import NavItem from './NavItem.svelte';
import ToggleDark from './ToggleDark.svelte';

var root = $.from_html(`<div><!></div>`);
var root_1 = $.from_html(`<header><div class="header-inner svelte-1mx54u2"><div class="left svelte-1mx54u2"><!> <div><!></div></div> <!> <nav class="nav-links svelte-1mx54u2" aria-label="Menu"><div class="navbar-pc svelte-1mx54u2"><div class="sm:flex none"></div> <!> <!> <!></div></nav></div> <!></header>`);

export default function Navbar($$anchor, $$props) {
	$.push($$props, true);

	const $scrollDirection = () => $.store_get(scrollDirection, '$scrollDirection', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const routeId = $.derived(() => page.route.id);
	const isHome = $.derived(() => $.get(routeId) === '/');
	const hasError = $.derived(() => page.error);
	let docsearchComponent = $.state(void 0);
	let searchComponent = $.state(void 0);

	onMount(async () => {
		// Load custom search component if it's a string path
		if (themeOptions.search && typeof themeOptions.search === 'string') {
			try {
				$.set(searchComponent, (await import(/* @vite-ignore */ themeOptions.search)).default, true);
			} catch(e) {
				console.error('[sveltepress] Failed to load custom search component:', e);
			}
		}

		// Load docsearch if no custom search is provided
		if (themeOptions.docsearch && !themeOptions.search) {
			try {
				$.set(docsearchComponent, (await import('@sveltepress/docsearch/Search.svelte')).default, true);
			} catch(e) {
				console.error('[sveltepress] Failed to load docsearch component:', e);
			}
		}
	});

	var header = root_1();
	let classes;
	var div = $.child(header);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	NavbarMobile(node, {});

	var div_2 = $.sibling(node, 2);
	let classes_1;
	var node_1 = $.child(div_2);

	Logo(node_1, {});
	$.reset(div_2);
	$.reset(div_1);

	var node_2 = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_3 = root();
			let classes_2;
			var node_3 = $.child(div_3);

			$.component(node_3, () => $.get(searchComponent) || themeOptions.search, ($$anchor, $$component) => {
				$$component($$anchor, {});
			});

			$.reset(div_3);

			$.template_effect(() => classes_2 = $.set_class(div_3, 1, 'doc-search svelte-1mx54u2', null, classes_2, {
				'is-home': $.get(isHome),
				move: !$.get(isHome) && !$.get(hasError)
			}));

			$.append($$anchor, div_3);
		};

		var consequent_1 = ($$anchor) => {
			var div_4 = root();
			let classes_3;
			var node_4 = $.child(div_4);

			$.component(node_4, () => $.get(docsearchComponent), ($$anchor, $$component) => {
				$$component($$anchor, $.spread_props(() => themeOptions.docsearch));
			});

			$.reset(div_4);

			$.template_effect(() => classes_3 = $.set_class(div_4, 1, 'doc-search svelte-1mx54u2', null, classes_3, {
				'is-home': $.get(isHome),
				move: !$.get(isHome) && !$.get(hasError)
			}));

			$.append($$anchor, div_4);
		};

		$.if(node_2, ($$render) => {
			if ($.get(searchComponent) || themeOptions.search && typeof themeOptions.search !== 'string') $$render(consequent); else if (themeOptions.docsearch && $.get(docsearchComponent)) $$render(consequent_1, 1);
		});
	}

	var nav = $.sibling(node_2, 2);
	var div_5 = $.child(nav);
	var div_6 = $.child(div_5);

	$.each(div_6, 21, () => themeOptions.navbar, $.index, ($$anchor, navItem) => {
		NavItem($$anchor, $.spread_props(() => $.get(navItem)));
	});

	$.reset(div_6);

	var node_5 = $.sibling(div_6, 2);

	{
		var consequent_2 = ($$anchor) => {
			NavItem($$anchor, {
				get to() {
					return themeOptions.github;
				},
				external: true,
				icon: true,
				builtInIcon: true,
				title: 'Github',
				children: ($$anchor, $$slotProps) => {
					Github($$anchor, {});
				},
				$$slots: { default: true }
			});
		};

		$.if(node_5, ($$render) => {
			if (themeOptions.github) $$render(consequent_2);
		});
	}

	var node_6 = $.sibling(node_5, 2);

	{
		var consequent_3 = ($$anchor) => {
			NavItem($$anchor, {
				get to() {
					return themeOptions.discord;
				},
				external: true,
				icon: true,
				builtInIcon: true,
				title: 'Discord',
				children: ($$anchor, $$slotProps) => {
					Discord($$anchor, {});
				},
				$$slots: { default: true }
			});
		};

		$.if(node_6, ($$render) => {
			if (themeOptions.discord) $$render(consequent_3);
		});
	}

	var node_7 = $.sibling(node_6, 2);

	ToggleDark(node_7, {});
	$.reset(div_5);
	$.reset(nav);
	$.reset(div);

	var node_8 = $.sibling(div, 2);

	{
		var consequent_4 = ($$anchor) => {
			MobileSubNav($$anchor, {});
		};

		$.if(node_8, ($$render) => {
			if (!$.get(isHome)) $$render(consequent_4);
		});
	}

	$.reset(header);

	$.template_effect(() => {
		classes = $.set_class(header, 1, 'header svelte-1mx54u2', null, classes, { 'hidden-in-mobile': $scrollDirection() === 'down' });
		classes_1 = $.set_class(div_2, 1, 'logo-container svelte-1mx54u2', null, classes_1, { 'desktop-visible': $.get(hasError) || $.get(isHome) });
	});

	$.append($$anchor, header);
	$.pop();
	$$cleanup();
}