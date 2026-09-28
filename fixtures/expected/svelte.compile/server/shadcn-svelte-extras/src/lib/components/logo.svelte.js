import * as $ from 'svelte/internal/server';
import { cn } from '$lib/utils.js';

export default function Logo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, $$slots, $$events, ...rest } = $$props;

		$$renderer.push(`<svg${$.attributes(
			{
				...rest,
				viewBox: '0 0 16 16',
				fill: 'none',
				xmlns: 'http://www.w3.org/2000/svg',
				class: $.clsx(cn('size-4', className))
			},
			void 0,
			void 0,
			void 0,
			3
		)}><rect x="3" y="11.4853" width="12" height="1.5" rx="0.75" transform="rotate(-45 3 11.4853)" fill="#C2410C"></rect><rect x="7" y="12.6569" width="8" height="1.5" rx="0.75" transform="rotate(-45 7 12.6569)" fill="#C2410C"></rect><rect x="10.25" y="14" width="6" height="1.5" rx="0.75" transform="rotate(-90 10.25 14)" fill="black" class="dark:fill-white"></rect><rect x="8" y="10.25" width="6" height="1.5" rx="0.75" fill="black" class="dark:fill-white"></rect></svg>`);
	});
}