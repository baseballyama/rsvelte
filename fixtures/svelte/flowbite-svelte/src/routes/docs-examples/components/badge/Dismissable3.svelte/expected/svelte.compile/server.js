import * as $ from 'svelte/internal/server';
import { Badge } from "flowbite-svelte";

export default function Dismissable3($$renderer) {
	function handleClose(event) {
		event.preventDefault();
		alert("Badge dismissed");
	}

	Badge($$renderer, {
		dismissable: true,
		large: true,
		onclose: handleClose,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Default`);
		},
		$$slots: { default: true }
	});
}