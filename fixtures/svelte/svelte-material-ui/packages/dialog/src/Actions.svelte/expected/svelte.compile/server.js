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
			_smuiClass: 'mdc-dialog__actions',
			_smuiClassMap: {
				'smui-dialog__actions--reversed': 'SMUI:dialog:actions:reversed'
			},
			_smuiContexts: { 'SMUI:button:context': 'dialog:action' },
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