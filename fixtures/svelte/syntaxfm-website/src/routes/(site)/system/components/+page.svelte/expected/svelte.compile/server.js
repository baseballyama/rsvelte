import * as $ from 'svelte/internal/server';
import ComponentWindow from '$lib/ComponentWindow.svelte';
import NewsletterForm from '$/lib/newsletter/NewsletterForm.svelte';

export default function _page($$renderer) {
	const comp = NewsletterForm;

	ComponentWindow($$renderer, { Component: comp });
	$$renderer.push(`<!----> <div class="content"><iframe scrolling="no" src="/embed/600" title="Show Embed" style="width: 100%; height: 230px; max-width: 1200px; border: 1px solid black"></iframe></div>`);
}