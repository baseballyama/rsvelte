import * as $ from 'svelte/internal/server';
import { Button, CodeSnippet, Modal } from "carbon-components-svelte";

export default function CodeSnippetInModal($$renderer) {
	let open = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Open modal`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Modal($$renderer, {
			modalHeading: 'Install instructions',
			primaryButtonText: 'Done',
			secondaryButtonText: 'Cancel',
			get open() {
				return open;
			},

			set open($$value) {
				open = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				CodeSnippet($$renderer, { code: 'npm i carbon-components-svelte' });
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