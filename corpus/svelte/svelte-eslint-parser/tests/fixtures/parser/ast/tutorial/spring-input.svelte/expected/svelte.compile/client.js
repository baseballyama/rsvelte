import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { spring } from 'svelte/motion';

var root = $.from_html(`<div style="position: absolute; right: 1em;"><label><h3> </h3> <input type="range" min="0" max="1" step="0.01"/></label> <label><h3> </h3> <input type="range" min="0" max="1" step="0.01"/></label></div> <svg class="svelte-1qldjtf"><circle class="svelte-1qldjtf"></circle></svg>`, 1);

export default function Spring_input($$anchor, $$props) {
	$.push($$props, true);

	const $coords = () => $.store_get(coords, '$coords', $$stores);
	const $size = () => $.store_get(size, '$size', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let coords = spring({ x: 50, y: 50 }, { stiffness: 0.1, damping: 0.25 });
	let size = spring(10);
	var fragment = root();
	var div = $.first_child(fragment);
	var label = $.child(div);
	var h3 = $.child(label);
	var text = $.only_child(h3);
	var input = $.sibling(h3, 2);

	$.remove_input_defaults(input);
	$.reset(label);

	var label_1 = $.sibling(label, 2);
	var h3_1 = $.child(label_1);
	var text_1 = $.only_child(h3_1);
	var input_1 = $.sibling(h3_1, 2);

	$.remove_input_defaults(input_1);
	$.reset(label_1);
	$.reset(div);

	var svg = $.sibling(div, 2);
	var circle = $.only_child(svg);

	$.template_effect(() => {
		$.set_text(text, `stiffness (${coords.stiffness ?? ''})`);
		$.set_text(text_1, `damping (${coords.damping ?? ''})`);
		$.set_attribute(circle, 'cx', $coords().x);
		$.set_attribute(circle, 'cy', $coords().y);
		$.set_attribute(circle, 'r', $size());
	});

	$.bind_value(input, () => coords.stiffness, ($$value) => coords.stiffness = $$value);
	$.bind_value(input_1, () => coords.damping, ($$value) => coords.damping = $$value);
	$.event('mousemove', svg, (e) => coords.set({ x: e.clientX, y: e.clientY }));
	$.event('mousedown', svg, () => size.set(30));
	$.event('mouseup', svg, () => size.set(10));
	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}