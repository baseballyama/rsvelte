import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'code']);
var root = $.from_html(`<div></div>`);

export default function Code_preview($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var div = root();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [
		() => cn('[&_pre]:text-foreground [&_code]:py-4 [&_pre]:overflow-x-auto [&_pre]:overflow-y-auto [&_pre]:rounded-md [&_pre]:px-6 [&_pre]:py-4 [&_pre]:text-left [&_pre]:text-sm', $$props.class)
	]);

	$.html(div, () => $$props.code, true);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}