import * as $ from 'svelte/internal/server';
import { box, mergeProps } from 'svelte-toolbelt';
import { useStepperStepButton } from './stepper.svelte.js';
import { Button } from '../button';

export default function Stepper_previous($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			disabled = false,
			child,
			children,
			variant = 'outline',
			size = 'default',
			$$slots,
			$$events,
			...rest
		} = $$props;

		const buttonState = useStepperStepButton({
			type: box.with(() => 'previous'),
			disabled: box.with(() => disabled)
		});

		const mergedProps = $.derived(() => mergeProps(buttonState.props, rest, { variant, size, 'data-slot': 'stepper-previous' }));

		if (child) {
			$$renderer.push('<!--[0-->');
			child($$renderer, { props: mergedProps() });
			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');

			Button($$renderer, $.spread_props([
				mergedProps(),
				{
					children: ($$renderer) => {
						children?.($$renderer);
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				}
			]));
		}

		$$renderer.push(`<!--]-->`);
	});
}