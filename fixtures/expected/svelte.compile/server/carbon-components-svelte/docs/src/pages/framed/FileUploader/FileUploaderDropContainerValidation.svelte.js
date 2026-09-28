import * as $ from 'svelte/internal/server';
import { FileUploaderDropContainer, FileUploaderItem, Stack } from "carbon-components-svelte";

export default function FileUploaderDropContainerValidation($$renderer) {
	let files = [];
	let rejectedFiles = [];
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 2,
			children: ($$renderer) => {
				FileUploaderDropContainer($$renderer, {
					multiple: true,
					maxFileSize: 1024,
					preventDuplicate: true,
					labelText: 'Drag and drop files here or click to upload',
					get files() {
						return files;
					},

					set files($$value) {
						files = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> <!--[-->`);

				const each_array = $.ensure_array_like(files);

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					let file = each_array[i];

					FileUploaderItem($$renderer, { id: `accepted-${i}`, name: file.name, status: 'edit' });
				}

				$$renderer.push(`<!--]--> <!--[-->`);

				const each_array_1 = $.ensure_array_like(rejectedFiles);

				for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
					let { file, reason } = each_array_1[i];

					FileUploaderItem($$renderer, {
						invalid: true,
						id: `rejected-${i}`,
						name: file.name,
						errorSubject: reason === "size"
							? "File exceeds 1 kB limit"
							: reason === "duplicate" ? "Duplicate file" : "File rejected",

						errorBody: reason === "size"
							? "Please select a smaller file."
							: reason === "duplicate"
								? "This file is already in the list."
								: "The file did not pass validation.",
						status: 'edit'
					});
				}

				$$renderer.push(`<!--]-->`);
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