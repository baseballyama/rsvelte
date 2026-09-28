import * as $ from 'svelte/internal/server';
import { ClassAdder } from '@smui/common/classadder';

export default function Suffix($$renderer, $$props) {
	let { children, $$slots, $$events, ...restProps } = $$props;
	let element;

	function getElement() {
		return element.getElement();
	}

	ClassAdder($$renderer, $.spread_props([
		{
			_smuiClass: 'mdc-text-field__affix mdc-text-field__affix--suffix',
			tag: 'span'
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