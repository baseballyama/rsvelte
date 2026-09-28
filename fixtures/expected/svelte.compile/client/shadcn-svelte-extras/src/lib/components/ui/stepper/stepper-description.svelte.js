import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<div><!></div>`);

export default function Stepper_description($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	var div = root();

	$.attribute_effect(div, ($0) => ({ 'data-slot': 'stepper-description', class: $0, ...rest }), [
		() => cn('text-muted-foreground text-sm', 'group-data-[orientation=vertical]/stepper-nav:text-left', 'group-data-[orientation=horizontal]/stepper-nav:text-center', $$props.class)
	]);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}