import * as $ from 'svelte/internal/server';
import { createHeadSnippet } from '@layerstack/tailwind';
import { getSettings } from './settings.js';

export default function ThemeInit($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const darkThemes = getSettings().themes?.dark ?? [];
		let headSnippet = createHeadSnippet(darkThemes);

		$.head('1lcrmhb', $$renderer, ($$renderer) => {
			$$renderer.push(`${$.html(headSnippet)}`);
		});
	});
}