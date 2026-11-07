import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Avatar, Indicator } from "flowbite-svelte";
import { BugOutline } from "flowbite-svelte-icons";

export default function CustomDot($$anchor) {
	{
		const indicator = ($$anchor) => {
			Indicator($$anchor, {
				color: 'gray',
				border: true,
				size: 'xl',
				placement: 'top-right',
				children: ($$anchor, $$slotProps) => {
					BugOutline($$anchor, {});
				},
				$$slots: { default: true }
			});
		};

		Avatar($$anchor, {
			src: '/images/profile-picture-3.webp',
			indicator,
			$$slots: { indicator: true }
		});
	}
}