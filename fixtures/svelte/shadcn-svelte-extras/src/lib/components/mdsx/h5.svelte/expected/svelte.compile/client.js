import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<h5><!></h5>`);

export default function H5($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var h5 = root();

	$.attribute_effect(h5, ($0) => ({ class: $0, ...restProps }), [
		() => cn('mt-8 scroll-m-20 text-lg font-semibold tracking-tight', $$props.class)
	]);

	var node = $.child(h5);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(h5);
	$.append($$anchor, h5);
	$.pop();
}