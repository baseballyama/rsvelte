import * as $ from 'svelte/internal/server';
import { computedStyles } from '@layerstack/svelte-actions/styles';
import { cls } from '@layerstack/tailwind';

export default function ComputedStyles($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { class: className, children } = $$props;
		let styles = {};

		$$renderer.push(`<div${$.attr_class($.clsx(cls('lc-computed-styles', className)))}></div> `);
		children?.($$renderer, { styles });
		$$renderer.push(`<!---->`);
	});
}