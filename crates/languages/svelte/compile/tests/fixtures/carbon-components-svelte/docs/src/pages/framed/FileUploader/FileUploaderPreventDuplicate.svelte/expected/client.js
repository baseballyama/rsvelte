import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FileUploader, FileUploaderItem, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function FileUploaderPreventDuplicate($$anchor) {
	let rejectedFiles = [];

	Stack($$anchor, {
		gap: 2,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			FileUploader(node, {
				multiple: true,
				preventDuplicate: true,
				labelTitle: 'Upload files',
				buttonLabel: 'Add files',
				labelDescription: 'Duplicate files are rejected.',
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
					let $0 = $.derived(() => `rejected-dup-${$.get(i)}`);

					FileUploaderItem($$anchor, {
						invalid: true,
						get id() {
							return $.get($0);
						},

						get name() {
							return file().name;
						},
						errorSubject: 'Duplicate file',
						errorBody: 'This file is already in the list.',
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