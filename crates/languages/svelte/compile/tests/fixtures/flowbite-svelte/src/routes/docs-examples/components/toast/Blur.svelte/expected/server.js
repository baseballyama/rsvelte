import * as $ from 'svelte/internal/server';
import { Toast } from "flowbite-svelte";
import { blur } from "svelte/transition";
import { BellOutline } from "flowbite-svelte-icons";

export default function Blur($$renderer) {
	{
		function icon($$renderer) {
			BellOutline($$renderer, { class: 'h-6 w-6' });
		}

		Toast($$renderer, {
			transition: blur,
			color: 'purple',
			params: { amount: 10 },
			class: 'mb-4',
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Transition type: blur, amount: 10`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function icon($$renderer) {
			BellOutline($$renderer, { class: 'h-6 w-6' });
		}

		Toast($$renderer, {
			transition: blur,
			color: 'purple',
			params: { amount: 50, delay: 1000 },
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Transition type: blur, amount: 50, delay: 1000`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!---->`);
}