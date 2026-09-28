import * as $ from 'svelte/internal/server';
import ProgressBar from "./progress-bar.svelte";
import ProgressControlled from "./progress-controlled.svelte";
import ProgressFileUploadList from "./progress-file-upload-list.svelte";
import ProgressWithLabel from "./progress-with-label.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Progress($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			ProgressBar($$renderer, {});
			$$renderer.push(`<!----> `);
			ProgressWithLabel($$renderer, {});
			$$renderer.push(`<!----> `);
			ProgressControlled($$renderer, {});
			$$renderer.push(`<!----> `);
			ProgressFileUploadList($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}