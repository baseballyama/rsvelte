import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils';

export default function Shadcn_svelte($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...rest } = $$props;

		$$renderer.push(`<svg${$.attributes(
			{
				xmlns: 'http://www.w3.org/2000/svg',
				viewBox: '0 0 256 256',
				class: $.clsx(cn('size-4 shrink-0', className)),
				'aria-hidden': 'true',
				...rest
			},
			void 0,
			void 0,
			void 0,
			3
		)}><rect width="256" height="256" fill="none"></rect><line x1="208" y1="128" x2="128" y2="208" fill="none" stroke="#EB4F27" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></line><line x1="192" y1="40" x2="40" y2="192" fill="none" stroke="#EB4F27" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></line></svg>`);
	});
}