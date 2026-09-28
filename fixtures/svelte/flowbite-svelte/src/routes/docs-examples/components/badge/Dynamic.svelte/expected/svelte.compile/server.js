import * as $ from 'svelte/internal/server';
import { Badge } from "flowbite-svelte";

export default function Dynamic($$renderer) {
	setInterval(handleHover, 500);

	let color = "primary";

	function handleHover() {
		color = color === "primary" ? "secondary" : "primary";
	}

	Badge($$renderer, {
		large: true,
		color,
		children: ($$renderer) => {
			$$renderer.push(`<!---->Blinking badge`);
		},
		$$slots: { default: true }
	});
}