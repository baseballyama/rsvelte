import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<a><!></a>`);

export default function Button($$anchor, $$props) {
	let color = $.prop($$props, 'color', 3, 'orange'),
		href = $.prop($$props, 'href', 3, undefined),
		size = $.prop($$props, 'size', 3, 'l'),
		_class = $.prop($$props, 'class', 3, '');

	const paddings = { s: 'px-3 py-1', m: 'px-5 py-3', l: 'px-7 py-4' };
	const textSizes = { s: 'text-sm', m: 'text-base', l: 'text-lg' };

	const bgColors = {
		orange: 'bg-orange hover:bg-orange-400',
		blue: 'bg-blue hover:bg-blue-400',
		green: 'bg-green hover:bg-green-400'
	};

	const extras = $.derived(() => `${paddings[size()]} ${textSizes[size()]} ${bgColors[color()]} ${_class()}`);
	var a = root();
	var node = $.child(a);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(a);

	$.template_effect(() => {
		$.set_attribute(a, 'href', href());
		$.set_class(a, 1, `flex w-fit flex-row gap-3 rounded-md text-center text-white ${$.get(extras)}`);
	});

	$.append($$anchor, a);
}