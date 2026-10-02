import * as $ from 'svelte/internal/server';
import { Toast, Button } from "flowbite-svelte";
import { CameraPhotoOutline } from "flowbite-svelte-icons";

export default function Interactive($$renderer) {
	{
		function icon($$renderer) {
			CameraPhotoOutline($$renderer, { class: 'h-6 w-6' });
		}

		Toast($$renderer, {
			align: false,
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<span class="font-semibold text-gray-900 dark:text-white">Update available</span> <div class="mt-3"><div class="mb-2 text-sm font-normal">A new software version is available for download.</div> <div class="grid grid-cols-2 gap-2">`);

				Button($$renderer, {
					size: 'xs',
					class: 'w-full',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Update`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					size: 'xs',
					class: 'w-full',
					color: 'dark',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Not now`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></div>`);
			},
			$$slots: { icon: true, default: true }
		});
	}
}