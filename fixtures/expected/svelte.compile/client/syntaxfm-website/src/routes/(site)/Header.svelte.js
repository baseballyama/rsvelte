import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Logo from '$lib/Logo.svelte';
import Search from '$lib/search/Search.svelte';
import MobileNav from './MobileNav.svelte';
import { page } from '$app/stores';

var root = $.from_html(`<a title="Syntax Podcast Home" href="/"><!></a>`);
var root_1 = $.from_html(`<header><div class="header-container content svelte-se6v6o"><div class="logo svelte-se6v6o"><!></div> <nav class="desktop_nav content svelte-se6v6o"><a href="/shows">Shows</a> <a href="/videos">Video</a> <a href="/snackpack">Newsletter</a> <a href="/about">About</a> <a href="/potluck">Potluck Qs</a> <a target="_blank" href="https://sentry.shop" class="svelte-se6v6o">Swag</a> <!> <!></nav></div></header>`);

export default function Header($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let transparent = $.prop($$props, 'transparent', 3, false);
	var header = root_1();
	let classes;

	$.set_style(header, '', {}, { '--fg': 'var(--fg-1)' });

	var div = $.child(header);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	{
		var consequent = ($$anchor) => {
			var a = root();
			var node_1 = $.child(a);

			Logo(node_1, {});
			$.reset(a);
			$.append($$anchor, a);
		};

		$.if(node, ($$render) => {
			if ($page().url.pathname !== '/') $$render(consequent);
		});
	}

	$.reset(div_1);

	var nav = $.sibling(div_1, 2);
	var a_1 = $.child(nav);
	var a_2 = $.sibling(a_1, 2);
	var a_3 = $.sibling(a_2, 2);
	var a_4 = $.sibling(a_3, 2);
	var a_5 = $.sibling(a_4, 2);
	var node_2 = $.sibling(a_5, 4);

	Search(node_2, {});

	var node_3 = $.sibling(node_2, 2);

	MobileNav(node_3, {});
	$.reset(nav);
	$.reset(div);
	$.reset(header);

	$.template_effect(
		($0, $1, $2, $3, $4) => {
			classes = $.set_class(header, 1, 'layout full svelte-se6v6o', null, classes, { transparent: transparent() });
			$.set_class(a_1, 1, $0, 'svelte-se6v6o');
			$.set_class(a_2, 1, $1, 'svelte-se6v6o');
			$.set_class(a_3, 1, $2, 'svelte-se6v6o');
			$.set_class(a_4, 1, $3, 'svelte-se6v6o');
			$.set_class(a_5, 1, $4, 'svelte-se6v6o');
		},
		[
			() => $.clsx($page().url.pathname.startsWith('/shows') ? 'active' : ''),
			() => $.clsx($page().url.pathname.startsWith('/videos') ? 'active' : ''),
			() => $.clsx($page().url.pathname.startsWith('/snackpack') ? 'active' : ''),
			() => $.clsx($page().url.pathname.startsWith('/about') ? 'active' : ''),
			() => $.clsx($page().url.pathname.startsWith('/potluck') ? 'active' : '')
		]
	);

	$.append($$anchor, header);
	$.pop();
	$$cleanup();
}