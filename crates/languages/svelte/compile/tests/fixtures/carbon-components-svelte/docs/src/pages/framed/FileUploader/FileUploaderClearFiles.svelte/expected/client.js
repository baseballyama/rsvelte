import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, FileUploader } from "carbon-components-svelte";

var root = $.from_html(`<!> <br/> <!> <!>`, 1);

export default function FileUploaderClearFiles($$anchor) {
	let fileUploader;
	let files = [];
	var fragment = root();
	var node = $.first_child(fragment);

	$.bind_this(
		FileUploader(node, {
			multiple: true,
			labelTitle: 'Upload files',
			buttonLabel: 'Add files',
			status: 'complete',
			get files() {
				return files;
			},

			set files($$value) {
				files = $$value;
			},

			$$events: {
				change: (e) => {
					console.log("change", e.detail);
				},

				clear: () => {
					console.log("clear");
				}
			}
		}),
		($$value) => fileUploader = $$value,
		() => fileUploader
	);

	var node_1 = $.sibling(node, 4);

	{
		let $0 = $.derived(() => !files.length);

		Button(node_1, {
			kind: 'tertiary',
			get disabled() {
				return $.get($0);
			},

			$$events: {
				click: function (...$$args) {
					fileUploader.clearFiles?.apply(this, $$args);
				}
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('Clear (programmatic)');

				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		let $0 = $.derived(() => !files.length);

		Button(node_2, {
			kind: 'tertiary',
			get disabled() {
				return $.get($0);
			},
			$$events: { click: () => files = [] },
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_1 = $.text('Clear (two-way binding)');

				$.append($$anchor, text_1);
			},
			$$slots: { default: true }
		});
	}

	$.append($$anchor, fragment);
}