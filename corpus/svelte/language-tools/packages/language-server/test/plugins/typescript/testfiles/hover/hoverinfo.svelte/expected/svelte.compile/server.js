import * as $ from 'svelte/internal/server';
import HoverEventsInterface from './hover-events-interface.svelte';

export default function Hoverinfo($$renderer) {
	/** Documentation string */
	const withDocs = true;

	const withoutDocs = true;

	/**@author foo */
	const withJsDocTag = true;

	HoverEventsInterface($$renderer, {});
	$$renderer.push(`<!----> <custom-element foo="bar"></custom-element>`);
}