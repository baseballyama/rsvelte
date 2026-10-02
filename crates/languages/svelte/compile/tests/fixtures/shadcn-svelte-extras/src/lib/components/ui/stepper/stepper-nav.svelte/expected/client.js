import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils';
import { useStepperNav } from './stepper.svelte.js';
import { box } from 'svelte-toolbelt';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'orientation',
	'class',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function Stepper_nav($$anchor, $$props) {
	$.push($$props, true);

	let orientation = $.prop($$props, 'orientation', 3, 'horizontal'),
		rest = $.rest_props($$props, rest_excludes);

	const stepperNavState = useStepperNav({ orientation: box.with(() => orientation()) });
	var div = root();

	$.attribute_effect(
		div,
		($0) => ({
			'data-slot': 'stepper-nav',
			class: $0,
			...stepperNavState.props,
			...rest
		}),
		[
			() => cn(
				'group/stepper-nav flex',
				{
					'flex-row justify-between': orientation() === 'horizontal',
					'flex-col gap-2': orientation() === 'vertical'
				},
				$$props.class
			)
		]
	);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}