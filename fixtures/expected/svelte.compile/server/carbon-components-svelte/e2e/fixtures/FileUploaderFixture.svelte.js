import * as $ from 'svelte/internal/server';
import { FileUploader } from "carbon-components-svelte";

export default function FileUploaderFixture($$renderer) {
	let files = [];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		FileUploader($$renderer, {
			'data-testid': 'file-uploader',
			labelTitle: 'Upload files',
			buttonLabel: 'Add file',
			status: 'edit',
			iconDescription: 'Remove file',
			get files() {
				return files;
			},

			set files($$value) {
				files = $$value;
				$$settled = false;
			}
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}