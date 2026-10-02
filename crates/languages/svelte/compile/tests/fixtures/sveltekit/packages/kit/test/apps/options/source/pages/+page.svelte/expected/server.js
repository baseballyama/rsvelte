import * as $ from 'svelte/internal/server';
import Message from '#lib/Message.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<h2>We're on index.svelte</h2> `);
	Message($$renderer, {});
	$$renderer.push(`<!---->`);
}