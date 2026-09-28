import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FileUploaderDropContainer, FileUploaderItem, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function FileUploaderDropContainerValidation($$anchor) {
	let files = [];
	let rejectedFiles = [];

	Stack($$anchor, {
		gap: 2,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			FileUploaderDropContainer(node, {
				multiple: true,
				maxFileSize: 1024,
				preventDuplicate: true,
				labelText: 'Drag and drop files here or click to upload',
				get files() {
					return files;
				},

				set files($$value) {
					files = $$value;
				},

				$$events: {
					rejected: (e) => {
						rejectedFiles = [...rejectedFiles, ...e.detail];
					}
				}
			});

			var node_1 = $.sibling(node, 2);

			$.each(node_1, 19, () => files, (file, i) => `${file.name}-${file.lastModified}-${i}`, ($$anchor, file, i) => {
				{
					let $0 = $.derived(() => `accepted-${$.get(i)}`);

					FileUploaderItem($$anchor, {
						get id() {
							return $.get($0);
						},

						get name() {
							return $.get(file).name;
						},
						status: 'edit',
						$$events: {
							delete: () => {
								files = files.filter((f) => f !== $.get(file));
							}
						}
					});
				}
			});

			var node_2 = $.sibling(node_1, 2);

			$.each(node_2, 19, () => rejectedFiles, ({ file, reason }, i) => `${file.name}-${reason}-${i}`, ($$anchor, $$item, i) => {
				let file = () => $.get($$item).file;
				let reason = () => $.get($$item).reason;

				{
					let $0 = $.derived(() => `rejected-${$.get(i)}`);

					let $1 = $.derived(() => reason() === "size"
						? "File exceeds 1 kB limit"
						: reason() === "duplicate" ? "Duplicate file" : "File rejected");

					let $2 = $.derived(() => reason() === "size"
						? "Please select a smaller file."
						: reason() === "duplicate"
							? "This file is already in the list."
							: "The file did not pass validation.");

					FileUploaderItem($$anchor, {
						invalid: true,
						get id() {
							return $.get($0);
						},

						get name() {
							return file().name;
						},

						get errorSubject() {
							return $.get($1);
						},

						get errorBody() {
							return $.get($2);
						},
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