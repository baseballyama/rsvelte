import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<h2><!></h2>`);

export default function H2($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var h2 = root();

	$.attribute_effect(h2, ($0) => ({ class: $0, ...restProps }), [
		() => cn('border-border [&+]*:[code]:text-xl mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 lg:mt-16 [&+.steps]:!mt-0 [&+.steps>h3]:!mt-4 [&+h3]:!mt-6 [&+p]:!mt-4', $$props.class)
	]);

	var node = $.child(h2);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(h2);
	$.append($$anchor, h2);
	$.pop();
}