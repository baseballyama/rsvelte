import * as $ from 'svelte/internal/server';
import { ClassAdder } from '@smui/common/classadder';

export default function Subtitle($$renderer, $$props) {
	let { children, $$slots, $$events, ...restProps } = $$props;
	let element;

	function getElement() {
		return element.getElement();
	}

	ClassAdder($$renderer, $.spread_props([
		{ _smuiClass: 'mdc-drawer__subtitle', tag: 'h2' },
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