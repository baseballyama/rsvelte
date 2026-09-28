import * as $ from 'svelte/internal/server';
import { ClassAdder } from '@smui/common/classadder';

export default function Actions($$renderer, $$props) {
	let { children, $$slots, $$events, ...restProps } = $$props;
	let element;

	function getElement() {
		return element.getElement();
	}

	ClassAdder($$renderer, $.spread_props([
		{
			_smuiClass: 'mdc-snackbar__actions',
			_smuiProps: { 'aria-atomic': 'true' },
			_smuiContexts: {
				'SMUI:button:context': 'snackbar:actions',
				'SMUI:icon-button:context': 'snackbar:actions',
				'SMUI:label:context': undefined
			},
			tag: 'div'
		},
		restProps,
		{
			children: ($$renderer) => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		}
	]));

	$.bind_props($$props, { getElement });
}