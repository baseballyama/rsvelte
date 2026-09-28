import * as $ from 'svelte/internal/server';
import { getContext } from 'svelte';
import { ClassAdder } from '@smui/common/classadder';

export default function Title($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, $$slots, $$events, ...restProps } = $$props;
		let element;
		let setFullscreenTitleless = getContext('SMUI:dialog:setFullscreenTitleless');

		if (setFullscreenTitleless != null) {
			setFullscreenTitleless(false);
		}

		function getElement() {
			return element.getElement();
		}

		ClassAdder($$renderer, $.spread_props([
			{ _smuiClass: 'mdc-dialog__title', tag: 'h2' },
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