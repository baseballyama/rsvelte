import * as $ from 'svelte/internal/server';
import { Toast } from "flowbite-svelte";
import { ImageOutline } from "flowbite-svelte-icons";

export default function Icons($$renderer) {
	{
		function icon($$renderer) {
			ImageOutline($$renderer, { class: 'h-6 w-6' });
		}

		Toast($$renderer, {
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<!---->There is a box icon.`);
			},
			$$slots: { icon: true, default: true }
		});
	}

	$$renderer.push(`<!----> `);

	Toast($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->No icon at all.`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}