import * as $ from 'svelte/internal/server';
import { TreeViewNodeContext } from '../modules/node-context.js';

export default function Node_provider($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;

		const children = $.derived(() => props.children),
			nodeProps = $.derived(() => props.value);

		TreeViewNodeContext.provide(() => nodeProps());
		children()?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}