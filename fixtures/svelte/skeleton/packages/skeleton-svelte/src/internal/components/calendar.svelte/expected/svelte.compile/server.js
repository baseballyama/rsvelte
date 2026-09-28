import * as $ from 'svelte/internal/server';
import { mergeProps } from '@zag-js/svelte';

export default function Calendar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const rest = $.derived(() => $.exclude_from_object(props, []));

		const attributes = $.derived(() => mergeProps(
			{
				xmlns: 'http://www.w3.org/2000/svg',
				width: '24',
				height: '24',
				viewBox: '0 0 24 24',
				fill: 'none',
				stroke: 'currentColor',
				'stroke-width': '2',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round'
			},
			rest()
		));

		$$renderer.push(`<svg${$.attributes({ ...attributes() }, void 0, void 0, void 0, 3)}><path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path></svg>`);
	});
}