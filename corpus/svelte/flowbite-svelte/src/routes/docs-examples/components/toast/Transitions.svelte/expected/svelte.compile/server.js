import * as $ from 'svelte/internal/server';
import { Toast } from "flowbite-svelte";
import { slide, scale } from "svelte/transition";
import { quintOut } from "svelte/easing";
import { CheckCircleSolid } from "flowbite-svelte-icons";

export default function Transitions($$renderer) {
	{
		function icon($$renderer) {
			CheckCircleSolid($$renderer, { class: 'h-6 w-6' });
		}

		Toast($$renderer, {
			transition: slide,
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Transition type: slide`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function icon($$renderer) {
			CheckCircleSolid($$renderer, { class: 'h-6 w-6' });
		}

		Toast($$renderer, {
			transition: scale,
			params: { delay: 250, duration: 300, easing: quintOut },
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Transition type: scale, delay: 250, duration: 300, easing: quintOut`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function icon($$renderer) {
			CheckCircleSolid($$renderer, { class: 'h-6 w-6' });
		}

		Toast($$renderer, {
			params: { delay: 250, duration: 1000 },
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Transition type: fade, delay: 250, duration: 1000`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!---->`);
}