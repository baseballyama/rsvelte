import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useStepperItemTrigger } from './stepper.svelte.js';
import { box } from 'svelte-toolbelt';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'disabled',
	'onclick',
	'onkeydown',
	'class',
	'children'
]);

var root = $.from_html(`<button><!></button>`);

export default function Stepper_trigger($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		disabled = $.prop($$props, 'disabled', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	const triggerState = useStepperItemTrigger({
		ref: box.with(() => ref()),
		disabled: box.with(() => disabled() ?? false),
		onclick: box.with(() => $$props.onclick),
		onkeydown: box.with(() => $$props.onkeydown)
	});

	var button = root();

	$.attribute_effect(
		button,
		($0) => ({
			'data-slot': 'stepper-trigger',
			class: $0,
			...triggerState.props,
			...restProps
		}),
		[
			() => cn('group/stepper-trigger z-1 flex outline-none', 'group-data-[orientation=horizontal]/stepper-nav:flex-col', 'group-data-[orientation=vertical]/stepper-nav:flex-row group-data-[orientation=vertical]/stepper-nav:gap-4', $$props.class)
		]
	);

	var node = $.child(button);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(button);
	$.bind_this(button, ($$value) => ref($$value), () => ref());
	$.append($$anchor, button);
	$.pop();
}