import * as $ from 'svelte/internal/server';
import { Collapsible as CollapsiblePrimitive } from 'bits-ui';

export default function Collapsible_content($$renderer, $$props) {
	let { children, $$slots, $$events, ...rest } = $$props;
	const children_render = $.derived(() => children);

	{
		function children($$renderer) {
			children_render()?.($$renderer);
			$$renderer.push(`<!---->`);
		}

		if (CollapsiblePrimitive.Content) {
			$$renderer.push('<!--[-->');
			CollapsiblePrimitive.Content($$renderer, $.spread_props([rest, { children, $$slots: { default: true } }]));
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}
	}
}