import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils';
import { useStepperSeparator } from './stepper.svelte.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<div><!></div>`);

export default function Stepper_separator($$anchor, $$props) {
	$.push($$props, true);

	let rest = $.rest_props($$props, rest_excludes);
	const separatorState = useStepperSeparator();
	var div = root();

	$.attribute_effect(
		div,
		($0) => ({
			'data-slot': 'stepper-separator',
			class: $0,
			...separatorState.props,
			...rest
		}),
		[
			() => cn('bg-muted data-[state=completed]:bg-primary absolute shrink-0 transition-colors', 'group-data-[orientation=horizontal]/stepper-nav:top-[12px] group-data-[orientation=horizontal]/stepper-nav:h-1 group-data-[orientation=horizontal]/stepper-nav:w-full', 'group-data-[orientation=vertical]/stepper-nav:top-[28px] group-data-[orientation=vertical]/stepper-nav:left-[12px] group-data-[orientation=vertical]/stepper-nav:h-full group-data-[orientation=vertical]/stepper-nav:w-1', { hidden: separatorState.itemState.isLast }, $$props.class)
		]
	);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}