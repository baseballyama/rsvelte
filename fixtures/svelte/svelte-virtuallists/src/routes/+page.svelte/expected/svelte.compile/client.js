import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';

var root = $.from_html(`<h1>Welcome to Svelte-VirtualLists</h1> <a><img alt="Minified Size"/></a> <p>Performant rendering of large lists and tables</p> <h2>Features</h2> <ul><li>Optimizes rendering by only displaying visible items</li> <li>Supports Horizontal and vertical layouts</li> <li>Supports Lists and Tables/Grids</li> <li>Supports Variable row heights or widths</li> <li>Supports Legacy browser such as IE 11</li> <li>Supports Touch devices</li> <li>Supports RTL rendering with auto-detection</li> <li>Supports Rich programmatic API and events</li> <li>Svelte, Sveltekit & Typescript friendly</li></ul> <a href="https://github.com/orefalo/svelte-virtuallists">https://github.com/orefalo/svelte-virtuallists</a>`, 1);

export default function _page($$anchor) {
	var fragment = root();
	var a = $.sibling($.first_child(fragment), 2);
	var img = $.only_child(a);

	$.next(8);

	$.template_effect(() => {
		$.set_attribute(a, 'href', `${base ?? ''}/minified-size`);
		$.set_attribute(img, 'src', `${base ?? ''}/minified-size-badge.svg`);
	});

	$.append($$anchor, fragment);
}