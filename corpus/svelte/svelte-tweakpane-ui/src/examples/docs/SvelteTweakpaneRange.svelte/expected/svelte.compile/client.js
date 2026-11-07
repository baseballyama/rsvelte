import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Slider } from '$lib';

var root = $.from_html(`<!> <pre> </pre>`, 1);

export default function SvelteTweakpaneRange($$anchor) {
	let speed = 50;
	var fragment = root();
	var node = $.first_child(fragment);

	Slider(node, {
		max: 100,
		min: 0,
		get value() {
			return speed;
		},

		set value($$value) {
			speed = $$value;
		}
	});

	var pre = $.sibling(node, 2);
	var text = $.only_child(pre);

	$.template_effect(() => $.set_text(text, `${speed ?? ''}
`));

	$.append($$anchor, fragment);
}