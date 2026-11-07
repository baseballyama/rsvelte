import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Logo from './logo.svelte';
import Search from './search';
import Socials from './socials.svelte';
import Preferences from './preferences/index.svelte';
import Menu from './menu.svelte';
import * as config from '$lib/site/config';

var root = $.from_html(`<header><div class="container svelte-1zwcjd"><div class="logo svelte-1zwcjd"><!> <a href="/" class="svelte-1zwcjd"> </a></div> <!> <!> <nav class="svelte-1zwcjd"><!> <!></nav></div></header>`);

export default function Header($$anchor, $$props) {
	$.push($$props, true);

	let scrollY = $.state(0);
	let scrolled = $.derived(() => $.get(scrollY) > 0);
	var header = root();
	let classes;
	var div = $.child(header);
	var div_1 = $.child(div);
	var node = $.child(div_1);

	Logo(node, {});

	var a = $.sibling(node, 2);
	var text = $.only_child(a, true);

	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	Search(node_1, {});

	var node_2 = $.sibling(node_1, 2);

	Socials(node_2, {});

	var nav = $.sibling(node_2, 2);
	var node_3 = $.child(nav);

	Preferences(node_3, {});

	var node_4 = $.sibling(node_3, 2);

	Menu(node_4, {});
	$.reset(nav);
	$.reset(div);
	$.reset(header);

	$.template_effect(() => {
		classes = $.set_class(header, 1, 'svelte-1zwcjd', null, classes, { scrolled: $.get(scrolled) });
		$.set_text(text, config.siteName);
	});

	$.bind_window_scroll('y', () => $.get(scrollY), ($$value) => $.set(scrollY, $$value, true));
	$.append($$anchor, header);
	$.pop();
}