import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DialogChatSettings from "./dialog-chat-settings.svelte";
import DialogNoCloseButton from "./dialog-no-close-button.svelte";
import DialogScrollableContent from "./dialog-scrollable-content.svelte";
import DialogWithForm from "./dialog-with-form.svelte";
import DialogWithStickyFooter from "./dialog-with-sticky-footer.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Dialog($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			DialogWithForm(node, {});

			var node_1 = $.sibling(node, 2);

			DialogScrollableContent(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			DialogWithStickyFooter(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			DialogNoCloseButton(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			DialogChatSettings(node_4, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}