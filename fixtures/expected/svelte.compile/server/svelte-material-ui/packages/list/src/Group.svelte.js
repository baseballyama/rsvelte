import * as $ from 'svelte/internal/server';
import { ClassAdder } from '@smui/common/classadder';

export default function Group($$renderer, $$props) {
	let { children, $$slots, $$events, ...restProps } = $$props;
	let element;

	function getElement() {
		return element.getElement();
	}

	ClassAdder($$renderer, $.spread_props([
		{ _smuiClass: 'mdc-deprecated-list-group', tag: 'div' },
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