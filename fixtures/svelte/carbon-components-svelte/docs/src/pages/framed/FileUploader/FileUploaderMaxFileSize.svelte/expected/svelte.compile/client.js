import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FileUploader, FileUploaderItem, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function FileUploaderMaxFileSize($$anchor) {
	let rejectedFiles = [];

	Stack($$anchor, {
		gap: 2,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			FileUploader(node, {
				multiple: true,
				maxFileSize: 1024 * 1024,
				labelTitle: 'Upload files',
				buttonLabel: 'Add files',
				labelDescription: 'Maximum file size: 1 MB',
				status: 'edit',
				$$events: {
					rejected: (e) => {
						rejectedFiles = e.detail;
					}
				}
			});

			var node_1 = $.sibling(node, 2);

			$.each(node_1, 19, () => rejectedFiles, ({ file }, i) => `${file.name}-${file.lastModified}-${i}`, ($$anchor, $$item, i) => {
				let file = () => $.get($$item).file;

				{
					let $0 = $.derived(() => `rejected-size-${$.get(i)}`);

					FileUploaderItem($$anchor, {
						invalid: true,
						get id() {
							return $.get($0);
						},

						get name() {
							return file().name;
						},
						errorSubject: 'File exceeds 1 MB limit',
						errorBody: 'Please select a smaller file.',
						status: 'edit',
						$$events: {
							delete: () => {
								rejectedFiles = rejectedFiles.filter((r) => r.file !== file());
							}
						}
					});
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}