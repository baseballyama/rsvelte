import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { intersect } from '@svelte-put/intersect';

var root_1 = $.from_html(`<main><section></section></main>`);

export default function Initialization_options($$anchor) {
	let root;
	var main = root_1();
	var section = $.child(main);

	$.action(section, ($$node, $$action_arg) => intersect?.($$node, $$action_arg), () => ({
		enabled: true,
		root,
		rootMargin: '100px 0px 50px 0px',
		threshold: [0.2, 0.5, 1]
	}));

	$.reset(main);
	$.bind_this(main, ($$value) => root = $$value, () => root);
	$.append($$anchor, main);
}