import * as $ from 'svelte/internal/server';

export default function Edit($$renderer, $$props) {
	/** @type {{ [key: string]: any }} */
	const { $$slots, $$events, ...rest } = $$props;

	$$renderer.push(`<svg${$.attributes(
		{
			xmlns: 'http://www.w3.org/2000/svg',
			width: '1em',
			height: '1em',
			viewBox: '0 0 24 24',
			...rest
		},
		void 0,
		void 0,
		void 0,
		3
	)}><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M4 13.5V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2h-5.5"></path><path d="M14 2v6h6m-9.58 4.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21L4 22l.99-3.95l5.43-5.44Z"></path></g></svg>`);
}