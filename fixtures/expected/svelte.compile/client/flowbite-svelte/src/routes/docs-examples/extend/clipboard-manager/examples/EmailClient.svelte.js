import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ClipboardManager } from "flowbite-svelte";

var root = $.from_html(`<div id="email-body"><textarea placeholder="Compose email..." class="w-full"></textarea></div> <!>`, 1);

export default function EmailClient($$anchor) {
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

	var fragment = root();
	var node = $.sibling($.first_child(fragment), 2);

	ClipboardManager(node, {
		get items() {
			return responses;
		},
		enableSelectionMenu: true,
		selectionTarget: '#email-body',
		placeholder: 'Save new response...',
		storageKey: 'email-client'
	});

	$.append($$anchor, fragment);
}