import * as $ from 'svelte/internal/server';
import { Button, Modal, P } from "flowbite-svelte";

export default function Full($$renderer) {
	let defaultModal = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			onclick: () => defaultModal = true,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Default modal`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Modal($$renderer, {
			fullscreen: true,
			size: 'none',
			class: 'bg-gray-100',
			get open() {
				return defaultModal;
			},

			set open($$value) {
				defaultModal = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				$$renderer.push(`<div class="flex h-screen items-center justify-center">`);

				P($$renderer, {
					class: 'text-3xl',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Content`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}