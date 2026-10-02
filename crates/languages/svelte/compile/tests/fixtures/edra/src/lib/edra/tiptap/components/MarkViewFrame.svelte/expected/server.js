import * as $ from 'svelte/internal/server';

export default function MarkViewFrame($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { component: Component, extension, $$slots, $$events, ...props } = $$props;
		let className = $.derived(() => `svelte-renderer mark-${extension?.name || 'unknown'}`);

		$$renderer.push(`<div${$.attr_class($.clsx(className()))} data-mark-view-wrapper="">`);

		if (Component) {
			$$renderer.push('<!--[-->');
			Component($$renderer, $.spread_props([{ extension }, props]));
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	});
}