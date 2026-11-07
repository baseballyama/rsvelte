import * as $ from 'svelte/internal/server';
import { Button, DemoContainer } from "@svecodocs/kit";
import { onClickOutside } from "runed";

export default function On_click_outside_dialog($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let dialog = void 0;

		const clickOutside = onClickOutside(
			() => dialog,
			() => {
				dialog.close();
				clickOutside.stop();
			},
			{ immediate: false }
		);

		function openDialog() {
			dialog.showModal();
			clickOutside.start();
		}

		function closeDialog() {
			dialog.close();
			clickOutside.stop();
		}

		DemoContainer($$renderer, {
			children: ($$renderer) => {
				Button($$renderer, {
					size: 'sm',
					onclick: openDialog,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Open Dialog`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <dialog class="bg-background fixed left-1/2 top-1/2 m-0 -translate-x-1/2 -translate-y-1/2 transform rounded-xl border-none p-0 shadow-lg backdrop:bg-black/50"><div class="min-w-[360px] max-w-[400px] rounded-xl p-8"><p class="mb-4">This is a dialog.</p> <p class="mb-4">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Neque sunt aut sit exercitationem
				deleniti doloremque quo quasi, expedita omnis dicta eaque, eveniet nesciunt nobis sint
				atque? Praesentium facilis officiis perferendis.</p> `);

				Button($$renderer, {
					size: 'sm',
					variant: 'outline',
					onclick: closeDialog,
					children: ($$renderer) => {
						$$renderer.push(`<!---->Close Dialog`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div></dialog>`);
			},
			$$slots: { default: true }
		});
	});
}