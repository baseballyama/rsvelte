import * as $ from 'svelte/internal/server';
import { Toast, Avatar, Button } from "flowbite-svelte";

export default function Toast_1($$renderer) {
	{
		function icon($$renderer) {
			Avatar($$renderer, { src: '/images/profile-picture-1.webp', class: 'h-8' });
		}

		Toast($$renderer, {
			align: false,
			color: undefined,
			icon,
			children: ($$renderer) => {
				$$renderer.push(`<div class="ms-3 text-sm font-normal"><span class="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Jese Leos</span> <div class="mb-2 text-sm font-normal">Hi Neil, thanks for sharing your thoughts regarding Flowbite.</div> `);

				Button($$renderer, {
					size: 'xs',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Reply`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { icon: true, default: true }
		});
	}
}