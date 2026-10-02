import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<div><!></div>`);

export default function Stepper_indicator($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	var div = root();

	$.attribute_effect(div, ($0) => ({ 'data-slot': 'stepper-indicator', class: $0, ...rest }), [
		() => cn('bg-primary text-primary-foreground z-1 flex size-7 shrink-0 items-center justify-center rounded-full ring-3 transition-colors select-none [&_svg]:size-4', 'group-data-[state=inactive]/stepper-trigger:text-muted-foreground group-data-[state=inactive]/stepper-trigger:bg-muted ring-background', 'group-focus-visible/stepper-trigger:ring-ring/50', $$props.class)
	]);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}