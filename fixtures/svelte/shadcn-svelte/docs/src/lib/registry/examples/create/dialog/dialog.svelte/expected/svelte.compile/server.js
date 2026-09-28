import * as $ from 'svelte/internal/server';
import DialogChatSettings from "./dialog-chat-settings.svelte";
import DialogNoCloseButton from "./dialog-no-close-button.svelte";
import DialogScrollableContent from "./dialog-scrollable-content.svelte";
import DialogWithForm from "./dialog-with-form.svelte";
import DialogWithStickyFooter from "./dialog-with-sticky-footer.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Dialog($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			DialogWithForm($$renderer, {});
			$$renderer.push(`<!----> `);
			DialogScrollableContent($$renderer, {});
			$$renderer.push(`<!----> `);
			DialogWithStickyFooter($$renderer, {});
			$$renderer.push(`<!----> `);
			DialogNoCloseButton($$renderer, {});
			$$renderer.push(`<!----> `);
			DialogChatSettings($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}