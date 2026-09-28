import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';
import { ClassAdder } from '@smui/common/classadder';

export default function RichActions($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, $$slots, $$events, ...restProps } = $$props;
		let element;

		setContext('SMUI:button:context', 'tooltip:rich-actions');

		function getElement() {
			return element.getElement();
		}

		ClassAdder($$renderer, $.spread_props([
			{
				_smuiClass: 'mdc-tooltip--rich-actions',
				_smuiContexts: { 'SMUI:button:context': 'tooltip:rich-actions' },
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
	});
}