import * as $ from 'svelte/internal/server';

export default function Next($$renderer, $$props) {
	/** @type {{ [key: string]: any }} */
	const { $$slots, $$events, ...rest } = $$props;

	$$renderer.push(`<svg${$.attributes({ width: '1em', height: '1em', viewBox: '0 0 24 24', ...rest }, void 0, void 0, void 0, 3)}><path d="M9 6l6 6l-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
}