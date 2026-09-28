import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { timelineContext } from './timeline-context.svelte';
import { cn } from '$lib/utils';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'defaultValue',
	'onValueChange',
	'orientation',
	'ref',
	'value'
]);

var root = $.from_html(`<div><!></div>`);

export default function Timeline($$anchor, $$props) {
	$.push($$props, true);

	let defaultValue = $.prop($$props, 'defaultValue', 3, 1),
		orientation = $.prop($$props, 'orientation', 3, 'vertical'),
		ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	let activeStep = $.state($.proxy(defaultValue()));

	function setActiveStep(step) {
		if ($$props.value === undefined) {
			$.set(activeStep, step, true);
		}

		$$props.onValueChange?.(step);
	}

	const currentStep = $.derived(() => $$props.value ?? $.get(activeStep));

	timelineContext.set({ activeStep: $.get(currentStep), setActiveStep });

	var div = root();

	$.attribute_effect(
		div,
		($0) => ({
			'data-slot': 'timeline',
			class: $0,
			'data-orientation': orientation(),
			...restProps
		}),
		[
			() => cn('group/timeline flex data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col', $$props.class)
		]
	);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div);
	$.pop();
}