import * as $ from 'svelte/internal/server';
import CreateProjectForm from "./create-project-form.svelte";
import GroupChatDialog from "./group-chat-dialog.svelte";
import ModelSelector from "./model-selector.svelte";
import PromptForm from "./prompt-form.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Chatgpt($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			PromptForm($$renderer, {});
			$$renderer.push(`<!----> `);
			ModelSelector($$renderer, {});
			$$renderer.push(`<!----> `);
			GroupChatDialog($$renderer, {});
			$$renderer.push(`<!----> `);
			CreateProjectForm($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}