import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { box, mergeProps } from 'svelte-toolbelt';
import { useStepperStepButton } from './stepper.svelte.js';
import { Button } from '../button';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'disabled',
	'child',
	'children',
	'variant',
	'size'
]);

export default function Stepper_next($$anchor, $$props) {
	$.push($$props, true);

	let disabled = $.prop($$props, 'disabled', 3, false),
		variant = $.prop($$props, 'variant', 3, 'default'),
		size = $.prop($$props, 'size', 3, 'default'),
		rest = $.rest_props($$props, rest_excludes);

	const buttonState = useStepperStepButton({
		type: box.with(() => 'next'),
		disabled: box.with(() => disabled())
	});

	const mergedProps = $.derived(() => mergeProps(buttonState.props, rest, {
		variant: variant(),
		size: size(),
		'data-slot': 'stepper-next'
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.child, () => ({ props: $.get(mergedProps) }));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			Button($$anchor, $.spread_props(() => $.get(mergedProps), {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_2 = $.first_child(fragment_3);

					$.snippet(node_2, () => $$props.children ?? $.noop);
					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			}));
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}