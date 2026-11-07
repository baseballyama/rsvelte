import * as $ from 'svelte/internal/server';
import { FileUploader, FileUploaderItem, Stack } from "carbon-components-svelte";

export default function FileUploaderPreventDuplicate($$renderer) {
	let rejectedFiles = [];

	Stack($$renderer, {
		gap: 2,
		children: ($$renderer) => {
			FileUploader($$renderer, {
				multiple: true,
				preventDuplicate: true,
				labelTitle: 'Upload files',
				buttonLabel: 'Add files',
				labelDescription: 'Duplicate files are rejected.',
				status: 'edit'
			});

			$$renderer.push(`<!----> <!--[-->`);

			const each_array = $.ensure_array_like(rejectedFiles);

			for (let i = 0, $$length = each_array.length; i < $$length; i++) {
				let { file } = each_array[i];

				FileUploaderItem($$renderer, {
					invalid: true,
					id: `rejected-dup-${i}`,
					name: file.name,
					errorSubject: 'Duplicate file',
					errorBody: 'This file is already in the list.',
					status: 'edit'
				});
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}