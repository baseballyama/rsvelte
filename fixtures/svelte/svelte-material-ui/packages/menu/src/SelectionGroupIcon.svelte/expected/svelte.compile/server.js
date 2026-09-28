import * as $ from 'svelte/internal/server';
import { ClassAdder } from '@smui/common/classadder';
import { Graphic } from '@smui/list';

export default function SelectionGroupIcon($$renderer, $$props) {
	let { children, $$slots, $$events, ...restProps } = $$props;
	let element;

	function getElement() {
		return element.getElement();
	}

	ClassAdder($$renderer, $.spread_props([
		{
			_smuiClass: 'mdc-menu__selection-group-icon',
			component: Graphic
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