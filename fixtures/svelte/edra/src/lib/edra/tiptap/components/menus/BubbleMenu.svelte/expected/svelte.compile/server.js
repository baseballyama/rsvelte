import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';
import { BubbleMenuPlugin } from '@tiptap/extension-bubble-menu';

export default function BubbleMenu($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			editor,
			pluginKey = 'bubbleMenu',
			updateDelay = undefined,
			resizeDelay = undefined,
			options = {},
			appendTo = undefined,
			shouldShow = null,
			getReferencedVirtualElement = undefined,
			children,
			class: className,
			$$slots,
			$$events,
			...rest
		} = $$props;

		let rootEl = void 0;
		let registered = false;

		$$renderer.push(`<div${$.attributes({
			class: $.clsx(
				// Guard against Hot re-runs driven by reactive reads (e.g. transaction version)
				// editor may already be destroyed during navigation
				className
			),
			...rest
		})}>`);

		children($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}