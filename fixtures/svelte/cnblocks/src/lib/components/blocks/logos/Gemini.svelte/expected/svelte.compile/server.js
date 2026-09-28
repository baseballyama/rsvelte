import * as $ from 'svelte/internal/server';

export default function Gemini($$renderer, $$props) {
	let { $$slots, $$events, ...rest } = $$props;

	$$renderer.push(`<svg${$.attributes(
		{
			height: '1em',
			style: 'flex: none; line-height: 1;',
			viewBox: '0 0 24 24',
			xmlns: 'http://www.w3.org/2000/svg',
			width: '1em',
			...rest
		},
		void 0,
		void 0,
		void 0,
		3
	)}><title>Gemini</title><defs><linearGradient id="lobe-icons-gemini-fill" x1="0%" x2="68.73%" y1="100%" y2="30.395%"><stop offset="0%" stop-color="#1C7DFF"></stop><stop offset="52.021%" stop-color="#1C69FF"></stop><stop offset="100%" stop-color="#F0DCD6"></stop></linearGradient></defs><path d="M12 24A14.304 14.304 0 000 12 14.304 14.304 0 0012 0a14.305 14.305 0 0012 12 14.305 14.305 0 00-12 12" fill="url(#lobe-icons-gemini-fill)" fill-rule="nonzero"></path></svg>`);
}