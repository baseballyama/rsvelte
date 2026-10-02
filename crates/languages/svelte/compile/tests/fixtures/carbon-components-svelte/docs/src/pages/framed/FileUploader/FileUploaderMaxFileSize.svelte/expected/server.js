import * as $ from 'svelte/internal/server';
import { FileUploader, FileUploaderItem, Stack } from "carbon-components-svelte";

export default function FileUploaderMaxFileSize($$renderer) {
	let rejectedFiles = [];

	Stack($$renderer, {
		gap: 2,
		children: ($$renderer) => {
			FileUploader($$renderer, {
				multiple: true,
				maxFileSize: 1024 * 1024,
				labelTitle: 'Upload files',
				buttonLabel: 'Add files',
				labelDescription: 'Maximum file size: 1 MB',
				status: 'edit'
			});

			$$renderer.push(`<!----> <!--[-->`);

			const each_array = $.ensure_array_like(rejectedFiles);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let { file } = each_array[i];

				FileUploaderItem($$renderer, {
					invalid: true,
					id: `rejected-size-${i}`,
					name: file.name,
					errorSubject: 'File exceeds 1 MB limit',
					errorBody: 'Please select a smaller file.',
					status: 'edit'
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}