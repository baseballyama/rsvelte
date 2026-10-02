import * as $ from 'svelte/internal/server';
import CopyButton from './copy-button.svelte';
import ViewComponentButton from './view-component-button.svelte';
import { cn } from '$lib/utils.js';

export default function Component($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			children,
			componentData,
			onShallowRouteClick,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		function actionButtons($$renderer, { source }) {
			$$renderer.push(`<div${$.attr_class($.clsx(cn('absolute top-2 right-2 flex items-center gap-x-2 rounded-lg')))}>`);
			ViewComponentButton($$renderer, { onclick: onShallowRouteClick });
			$$renderer.push(`<!----> <div class="bg-border h-6 w-px"></div> `);
			CopyButton($$renderer, { code: source });
			$$renderer.push(`<!----></div>`);
		}

		$$renderer.push(`<div${$.attributes({ ...restProps })}>`);
		actionButtons($$renderer, { source: componentData.code.raw.content });
		$$renderer.push(`<!----> <div>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div></div>`);
		$.bind_props($$props, { ref });
	});
}