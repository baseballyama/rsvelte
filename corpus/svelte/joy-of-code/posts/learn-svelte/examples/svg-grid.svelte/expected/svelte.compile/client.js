import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_svg(`<rect></rect>`);
var root_1 = $.from_html(`<div class="container"><svg></svg> <label class="svelte-1mwag0w"><span> </span> <input type="range"/></label></div>`);

export default function Svg_grid($$anchor) {
	let size = 300;
	let tiles = $.state(8);
	var div = root_1();
	var svg = $.child(div);

	$.set_attribute(svg, 'width', size);
	$.set_attribute(svg, 'height', size);

	$.each(svg, 21, () => Array($.get(tiles)), $.index, ($$anchor, $$item, col) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.each(node, 17, () => Array($.get(tiles)), $.index, ($$anchor, $$item, row) => {
			const tile = $.derived(() => size / $.get(tiles));
			const x = $.derived(() => col * $.get(tile));
			const y = $.derived(() => row * $.get(tile));
			const width = $.derived(() => $.get(tile));
			const height = $.derived(() => $.get(tile));
			const fill = $.derived(() => (col + row) % 2 === 0 ? 'orangered' : 'white');
			var rect = root();

			$.template_effect(() => {
				$.set_attribute(rect, 'x', $.get(x));
				$.set_attribute(rect, 'y', $.get(y));
				$.set_attribute(rect, 'width', $.get(width));
				$.set_attribute(rect, 'height', $.get(height));
				$.set_attribute(rect, 'fill', $.get(fill));
			});

			$.append($$anchor, rect);
		});

		$.append($$anchor, fragment);
	});

	$.reset(svg);

	var label = $.sibling(svg, 2);
	var span = $.child(label);
	var text = $.only_child(span);
	var input = $.sibling(span, 2);

	$.remove_input_defaults(input);
	$.set_attribute(input, 'min', 1);
	$.set_attribute(input, 'max', 40);
	$.reset(label);
	$.reset(div);
	$.template_effect(() => $.set_text(text, `${$.get(tiles) ?? ''} tiles:`));
	$.bind_value(input, () => $.get(tiles), ($$value) => $.set(tiles, $$value));
	$.append($$anchor, div);
}