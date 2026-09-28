import * as $ from 'svelte/internal/server';
import { Toast } from "flowbite-svelte";

export default function Events($$renderer) {
	Toast($$renderer, {
		onclick: () => alert("Toast clicked"),
		onclose: () => alert("Toast closing"),
		children: ($$renderer) => {
			$$renderer.push(`<!---->Click this toast or the close button to trigger an event.`);
		},
		$$slots: { default: true }
	});
}