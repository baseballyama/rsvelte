import * as $ from 'svelte/internal/server';

export default function Copy($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	$$renderer.push(`<svg${$.attributes(
		{
			xmlns: 'http://www.w3.org/2000/svg',
			viewBox: '0 0 24 24',
			...props
		},
		void 0,
		void 0,
		void 0,
		3
	)}><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M16 4h2a2 2 0 0 1 2 2v4m1 4H11"></path><path d="m15 10l-4 4l4 4"></path></g></svg>`);
}