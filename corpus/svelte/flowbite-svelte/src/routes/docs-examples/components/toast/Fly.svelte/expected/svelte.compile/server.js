import * as $ from 'svelte/internal/server';
import { Toast } from "flowbite-svelte";
import { fly } from "svelte/transition";
import { DownloadOutline } from "flowbite-svelte-icons";

export default function Fly($$renderer) {
	{
		function icon($$renderer) {
			DownloadOutline($$renderer, { class: 'h-6 w-6' });
		}

		Toast($$renderer, {
			transition: fly,
			params: { x: 200 },
			color: 'green',
			class: 'mb-4',
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Transition type: fly right`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	{
		function icon($$renderer) {
			DownloadOutline($$renderer, { class: 'h-6 w-6' });
		}

		Toast($$renderer, {
			transition: fly,
			params: { y: 200 },
			color: 'green',
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Transition type: fly down`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!---->`);
}