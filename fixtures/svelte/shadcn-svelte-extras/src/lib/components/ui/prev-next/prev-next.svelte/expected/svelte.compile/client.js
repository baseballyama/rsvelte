import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

var root = $.from_html(`<div><div><!></div> <div><!></div></div>`);

export default function Prev_next($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, undefined);
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.snippet(node, () => $$props.previous ?? $.noop);
	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_1 = $.child(div_2);

	$.snippet(node_1, () => $$props.next ?? $.noop);
	$.reset(div_2);
	$.reset(div);

	$.template_effect(($0) => $.set_class(div, 1, $0), [
		() => $.clsx(cn('flex place-items-center justify-between', className()))
	]);

	$.append($$anchor, div);
	$.pop();
}