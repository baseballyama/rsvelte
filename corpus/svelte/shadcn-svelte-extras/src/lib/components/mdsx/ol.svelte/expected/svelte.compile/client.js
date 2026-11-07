import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<ol><!></ol>`);

export default function Ol($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var ol = root();

	$.attribute_effect(ol, ($0) => ({ class: $0, ...restProps }), [
		() => cn('my-6 ml-6 list-decimal [&>li]:mt-2', $$props.class)
	]);

	var node = $.child(ol);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(ol);
	$.append($$anchor, ol);
	$.pop();
}