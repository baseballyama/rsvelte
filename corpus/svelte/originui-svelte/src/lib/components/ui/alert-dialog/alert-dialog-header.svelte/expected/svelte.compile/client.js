import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<div><!></div>`);

export default function Alert_dialog_header($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var div = root();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [
		() => cn('flex flex-col gap-1 text-center sm:text-left', $$props.class)
	]);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}