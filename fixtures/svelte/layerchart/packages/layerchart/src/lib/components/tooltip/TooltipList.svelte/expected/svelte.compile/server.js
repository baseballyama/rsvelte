import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';

export default function TooltipList($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref: refProp = void 0,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		let ref = void 0;

		$$renderer.push(`<div${$.attributes(
			{
				class: $.clsx(cls('lc-tooltip-list', className)),
				...restProps
			},
			'svelte-eck0ml'
		)}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref: refProp });
	});
}