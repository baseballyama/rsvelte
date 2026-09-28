import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { createHeadSnippet } from '@layerstack/tailwind';
import { getSettings } from './settings.js';

export default function ThemeInit($$anchor, $$props) {
	$.push($$props, true);

	const darkThemes = getSettings().themes?.dark ?? [];
	let headSnippet = createHeadSnippet(darkThemes);

	$.head('1lcrmhb', ($$anchor) => {
		var fragment = $.comment();
		var node = $.first_child(fragment);

		$.html(node, () => headSnippet);
		$.append($$anchor, fragment);
	});

	$.pop();
}