import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<h3><!></h3>`);

export default function H3($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var h3 = root();

	$.attribute_effect(h3, ($0) => ({ class: $0, ...restProps }), [
		() => cn('mt-12 scroll-m-20 text-2xl font-semibold tracking-tight [&+p]:!mt-4 *:[code]:text-xl', $$props.class)
	]);

	var node = $.child(h3);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(h3);
	$.append($$anchor, h3);
	$.pop();
}