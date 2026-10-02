import * as $ from 'svelte/internal/server';
import { Avatar } from "flowbite-svelte";

export default function PlaceholderInitial($$renderer) {
	Avatar($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->JL`);
		},
		$$slots: { default: true }
	});
}