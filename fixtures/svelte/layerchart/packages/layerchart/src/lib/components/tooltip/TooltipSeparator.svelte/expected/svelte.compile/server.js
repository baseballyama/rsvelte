import * as $ from 'svelte/internal/server';
import { cls } from '@layerstack/tailwind';

export default function TooltipSeparator($$renderer, $$props) {
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
				class: $.clsx(cls('lc-tooltip-separator', className)),
				...restProps
			},
			'svelte-37nscw'
		)}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
		$.bind_props($$props, { ref: refProp });
	});
}