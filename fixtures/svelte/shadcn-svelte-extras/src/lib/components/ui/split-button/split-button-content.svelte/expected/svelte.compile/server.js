import * as $ from 'svelte/internal/server';
import { SelectContent } from '$lib/components/ui/select';

export default function Split_button_content($$renderer, $$props) {
	let { align = 'end', children, $$slots, $$events, ...restProps } = $$props;

	SelectContent($$renderer, $.spread_props([
		{ 'data-slot': 'split-button-content', align, class: 'p-2' },
		restProps,
		{
			children: ($$renderer) => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		}
	]));
}