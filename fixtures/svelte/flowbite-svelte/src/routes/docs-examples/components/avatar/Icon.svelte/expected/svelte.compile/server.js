import * as $ from 'svelte/internal/server';
import { Avatar } from "flowbite-svelte";
import { BugOutline } from "flowbite-svelte-icons";

export default function Icon($$renderer) {
	Avatar($$renderer, {
		children: ($$renderer) => {
			BugOutline($$renderer, {});
		},
		$$slots: { default: true }
	});
}