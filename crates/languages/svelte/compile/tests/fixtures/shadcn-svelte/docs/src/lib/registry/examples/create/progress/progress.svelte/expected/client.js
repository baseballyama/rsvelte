import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ProgressBar from "./progress-bar.svelte";
import ProgressControlled from "./progress-controlled.svelte";
import ProgressFileUploadList from "./progress-file-upload-list.svelte";
import ProgressWithLabel from "./progress-with-label.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Progress($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ProgressBar(node, {});

			var node_1 = $.sibling(node, 2);

			ProgressWithLabel(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			ProgressControlled(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			ProgressFileUploadList(node_3, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}