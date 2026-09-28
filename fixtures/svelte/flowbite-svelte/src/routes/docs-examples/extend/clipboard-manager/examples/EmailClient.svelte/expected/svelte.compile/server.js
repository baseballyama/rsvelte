import * as $ from 'svelte/internal/server';
import { ClipboardManager } from "flowbite-svelte";

export default function EmailClient($$renderer) {
	let responses = [
		{
			id: 1,
			text: "Thank you for contacting us!",
			pinned: true,
			timestamp: Date.now() - 20 * 60 * 1000
		},

		{
			id: 2,
			text: "Your order has been shipped.",
			pinned: true,
			timestamp: Date.now() - 30 * 60 * 1000
		},

		{
			id: 3,
			text: "We appreciate your feedback.",
			pinned: true,
			timestamp: Date.now() - 45 * 60 * 1000
		}
	];

	$$renderer.push(`<div id="email-body"><textarea placeholder="Compose email..." class="w-full"></textarea></div> `);

	ClipboardManager($$renderer, {
		items: responses,
		enableSelectionMenu: true,
		selectionTarget: '#email-body',
		placeholder: 'Save new response...',
		storageKey: 'email-client'
	});

	$$renderer.push(`<!---->`);
}