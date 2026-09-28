import * as $ from 'svelte/internal/server';
import { ClipboardManager, Button, P } from "flowbite-svelte";

export default function WithModal($$renderer) {
	let clipboardModal = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			onclick: () => clipboardModal = true,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Show Clips`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		ClipboardManager($$renderer, {
			enableSelectionMenu: true,
			selectionTarget: '#with-modal',
			storageKey: 'modal-clipboard',
			get open() {
				return clipboardModal;
			},

			set open($$value) {
				clipboardModal = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> `);

		P($$renderer, {
			id: 'with-modal',
			class: 'py-4',
			children: ($$renderer) => {
				$$renderer.push(`<!---->Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam, repudiandae. Optio delectus nihil assumenda laborum voluptatum nam illum nobis blanditiis esse sapiente, cumque facere ab
  consequatur. Odit, architecto enim! At!`);
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