import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';

export default function TreeView($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children, class: className } = $$props;

		$$renderer.push(`<div${$.attr_class($.clsx(cls('flex flex-col', className)))}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}