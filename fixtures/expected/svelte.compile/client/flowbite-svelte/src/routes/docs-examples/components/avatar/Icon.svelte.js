import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar } from "flowbite-svelte";
import { BugOutline } from "flowbite-svelte-icons";

export default function Icon($$anchor) {
	Avatar($$anchor, {
		children: ($$anchor, $$slotProps) => {
			BugOutline($$anchor, {});
		},
		$$slots: { default: true }
	});
}