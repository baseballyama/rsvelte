import * as $ from 'svelte/internal/server';
import { Button, FileUploader, Stack } from "carbon-components-svelte";

export default function FileUploaderProgrammaticInputAccess($$renderer) {
	let inputRef = null;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 6,
			children: ($$renderer) => {
				Button($$renderer, {
					kind: 'secondary',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Open file picker`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				FileUploader($$renderer, {
					multiple: true,
					accept: [".jpg", ".jpeg", ".png"],
					labelTitle: 'Upload files',
					buttonLabel: 'Browse files',
					labelDescription: 'Only image files are accepted.',
					get ref() {
						return inputRef;
					},

					set ref($$value) {
						inputRef = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}