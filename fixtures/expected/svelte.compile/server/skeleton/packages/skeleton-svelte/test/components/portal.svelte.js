import * as $ from 'svelte/internal/server';
import { Portal } from '../../src/index.js';

export default function Portal_1($$renderer, $$props) {
	const { $$slots, $$events, ...props } = $$props;

	$$renderer.push(`<div data-testid="parent">`);

	Portal($$renderer, $.spread_props([
		props,
		{
			children: ($$renderer) => {
				$$renderer.push(`<div data-testid="child"></div>`);
			},
			$$slots: { default: true }
		}
	]));

	$$renderer.push(`<!----></div>`);
}