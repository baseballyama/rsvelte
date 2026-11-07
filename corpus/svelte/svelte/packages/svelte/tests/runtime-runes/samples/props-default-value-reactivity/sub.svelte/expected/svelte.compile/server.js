import * as $ from 'svelte/internal/server';
import { get_translation } from './translations.svelte.js';

export default function Sub($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { p0 = get_translation() } = $$props;

		$$renderer.push(`<p>greeting: ${$.escape(p0)}</p>`);
	});
}