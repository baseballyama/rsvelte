import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { asset, resolve } from '$app/paths';
import { page } from '$app/state';

var root = $.from_html(`<h1>Welcome to Svelte-Splitpane demo!</h1> <a href="https://github.com/orefalo/svelte-splitpanes">https://github.com/orefalo/svelte-splitpanes</a> <h2>Features</h2> <a><img alt="Minified Size"/></a> <ul><li>Support both dynamic horizontal and vertical splits</li> <li>Support defaults, min and max sizes</li> <li>Support multiple splits</li> <li>Support lifecyle events</li> <li>Support custom divider size or overlay</li> <li>Support splitter pane pushing</li> <li>Support RTL rendering with auto-detection</li> <li>Support first splitter on/off</li> <li>Support pane toggle</li> <li>Support edge snapping</li> <li>Support programmatic resizing and two-way size binding</li> <li>Support programmatic panes add/remove</li> <li>Support programmatic panes reordering by Svelte keyed each blocks</li> <li>Support for legacy browser such as IE 11</li> <li>Support for touch devices</li> <li>Sveltekit & Typescript friendly</li></ul>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const origin = page.url.origin;
	var fragment = root();
	var a = $.sibling($.first_child(fragment), 6);
	var img = $.only_child(a);

	$.next(2);

	$.template_effect(
		($0, $1) => {
			$.set_attribute(a, 'href', $0);
			$.set_attribute(img, 'src', $1);
		},
		[
			() => origin + resolve('/minified-size'),
			() => origin + asset('/minified-size-badge.svg')
		]
	);

	$.append($$anchor, fragment);
	$.pop();
}