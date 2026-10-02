import * as $ from 'svelte/internal/server';
import { TreeViewRootContext } from '../modules/root-context.js';

export default function Root_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const treeView = TreeViewRootContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, treeView);
		$$renderer.push(`<!---->`);
	});
}