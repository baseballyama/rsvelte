import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import logo from './logo.png?enhanced';

var root = $.from_html(`<enhanced:img id="birds" src="./birds.jpg" alt="birds"></enhanced:img> <enhanced:img id="playwright" src="./playwright-logo.svg" alt="Playwright logo"></enhanced:img> <enhanced:img id="logo" alt="Svelte logo"></enhanced:img>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	// see https://github.com/sveltejs/kit/issues/15616
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const rawImports = import.meta.glob('./image.svelte', { eager: true, query: '?raw' });

	var fragment = root();
	var enhanced_img = $.sibling($.first_child(fragment), 4);

	$.template_effect(() => $.set_attribute(enhanced_img, 'src', logo));
	$.append($$anchor, fragment);
	$.pop();
}