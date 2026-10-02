import * as $ from 'svelte/internal/server';
import { TreeViewNodeContext } from '../modules/node-context.js';

export default function Node_context($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const nodeProps = TreeViewNodeContext.consume();
		const children = $.derived(() => props.children);

		children()($$renderer, nodeProps);
		$$renderer.push(`<!---->`);
	});
}