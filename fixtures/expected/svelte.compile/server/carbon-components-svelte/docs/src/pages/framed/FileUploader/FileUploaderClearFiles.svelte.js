import * as $ from 'svelte/internal/server';
import { Button, FileUploader } from "carbon-components-svelte";

export default function FileUploaderClearFiles($$renderer) {
	let fileUploader;
	let files = [];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		FileUploader($$renderer, {
			multiple: true,
			labelTitle: 'Upload files',
			buttonLabel: 'Add files',
			status: 'complete',
			get files() {
				return files;
			},

			set files($$value) {
				files = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <br/> `);

		Button($$renderer, {
			kind: 'tertiary',
			disabled: !files.length,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Clear (programmatic)`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			kind: 'tertiary',
			disabled: !files.length,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Clear (two-way binding)`);
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