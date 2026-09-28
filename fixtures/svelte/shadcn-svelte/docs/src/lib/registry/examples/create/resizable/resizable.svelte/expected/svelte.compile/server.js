import * as $ from 'svelte/internal/server';
import ResizableControlled from "./resizable-controlled.svelte";
import ResizableHorizontal from "./resizable-horizontal.svelte";
import ResizableNested from "./resizable-nested.svelte";
import ResizableVertical from "./resizable-vertical.svelte";
import ResizableWithHandle from "./resizable-with-handle.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Resizable($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			ResizableHorizontal($$renderer, {});
			$$renderer.push(`<!----> `);
			ResizableVertical($$renderer, {});
			$$renderer.push(`<!----> `);
			ResizableWithHandle($$renderer, {});
			$$renderer.push(`<!----> `);
			ResizableNested($$renderer, {});
			$$renderer.push(`<!----> `);
			ResizableControlled($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}