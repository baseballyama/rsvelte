import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Fileupload, Helper } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Clearable($$anchor, $$props) {
	$.push($$props, true);

	let selectedFiles = $.state(null);

	let fileNames = $.derived(() => $.get(selectedFiles)
		? Array.from($.get(selectedFiles)).map((file) => file.name).join(", ")
		: "No files selected");

	var fragment = root();
	var node = $.first_child(fragment);

	Fileupload(node, {
		clearable: true,
		multiple: true,
		get files() {
			return $.get(selectedFiles);
		},

		set files($$value) {
			$.set(selectedFiles, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	Helper(node_1, {
		color: 'emerald',
		class: 'mt-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text();

			$.template_effect(() => $.set_text(text, `Selected files: ${$.get(fileNames) ?? ''}`));
			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	$.pop();
}