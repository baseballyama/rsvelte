import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';

export default function EditorContent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { editor, class: className } = $$props;
		let rootEl = void 0;

		$$renderer.push(`<div${$.attr_class($.clsx(
			// Already mounted — avoid re-appending / re-creating on every transaction
			className
		))}></div>`);
	});
}