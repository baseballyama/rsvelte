import * as $ from 'svelte/internal/server';
import { useActions } from './internal/index.js';

export default function Svg($$renderer, $$props) {
	if (console && console.warn) {
		console.warn('The @smui/common Svg component is deprecated. You can use `tag="svg"` now.');
	}

	/**
	 * An array of Action or [Action, ActionProps] to be applied to the element.
	 */
	let { use = [], children, $$slots, $$events, ...restProps } = $$props;

	let element;

	function getElement() {
		return element;
	}

	$$renderer.push(`<svg${$.attributes({ ...restProps }, void 0, void 0, void 0, 3)}>`);
	children?.($$renderer);
	$$renderer.push(`<!----></svg>`);
	$.bind_props($$props, { getElement });
}