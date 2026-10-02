import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CreateProjectForm from "./create-project-form.svelte";
import GroupChatDialog from "./group-chat-dialog.svelte";
import ModelSelector from "./model-selector.svelte";
import PromptForm from "./prompt-form.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Chatgpt($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			PromptForm(node, {});

			var node_1 = $.sibling(node, 2);

			ModelSelector(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			GroupChatDialog(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			CreateProjectForm(node_3, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}