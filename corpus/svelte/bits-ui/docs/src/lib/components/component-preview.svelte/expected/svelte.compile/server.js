import * as $ from 'svelte/internal/server';
import DemoContainer from "./demo-container.svelte";
import DemoCodeContainer from "./demo-code-container.svelte";
import { setCopyToClipboard } from "$lib/utils/copy-to-clipboard.svelte.js";

export default function Component_preview($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			preview,
			children,
			fileName,
			class: className,
			containerClass,
			size,
			name,
			nonExpandableItems = [],
			componentName = fileName,
			variant = "collapsed"
		} = $$props;

		setCopyToClipboard();

		DemoContainer($$renderer, {
			wrapperClass: containerClass,
			size,
			componentName,
			name,
			children: ($$renderer) => {
				preview($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		DemoCodeContainer($$renderer, {
			variant,
			fileName,
			class: className,
			nonExpandableItems,
			children: ($$renderer) => {
				children($$renderer);
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}