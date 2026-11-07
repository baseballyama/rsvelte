import * as $ from 'svelte/internal/server';
import { Avatar, Indicator } from "flowbite-svelte";
import { BugOutline } from "flowbite-svelte-icons";

export default function CustomDot($$renderer) {
	{
		function indicator($$renderer) {
			Indicator($$renderer, {
				color: 'gray',
				border: true,
				size: 'xl',
				placement: 'top-right',
				children: ($$renderer) => {
					BugOutline($$renderer, {});
				},
				$$slots: { default: true }
			});
		}

		Avatar($$renderer, {
			src: '/images/profile-picture-3.webp',
			indicator,
			$$slots: { indicator: true }
		});
	}
}