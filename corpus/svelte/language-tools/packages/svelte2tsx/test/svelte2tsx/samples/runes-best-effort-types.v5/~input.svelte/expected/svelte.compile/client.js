import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	let b = $.prop($$props, 'b', 3, true),
		c = $.prop($$props, 'c', 3, 1),
		d = $.prop($$props, 'd', 3, ''),
		e = $.prop($$props, 'e', 3, null),
		f = $.prop($$props, 'f', 19, () => ({})),
		g = $.prop($$props, 'g', 3, foo),
		h = $.prop($$props, 'h', 19, () => []),
		i = $.prop($$props, 'i', 3, undefined),
		k = $.prop($$props, 'k', 11, 1),
		l = $.prop($$props, 'l', 3, () => {});

	$.pop();
}