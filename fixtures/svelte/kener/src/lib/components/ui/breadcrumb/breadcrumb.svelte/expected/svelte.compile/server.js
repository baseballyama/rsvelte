import * as $ from 'svelte/internal/server';

export default function Breadcrumb($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = null,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<nav${$.attributes({
			'data-slot': 'breadcrumb',
			class: $.clsx(className),
			'aria-label': 'breadcrumb',
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></nav>`);
		$.bind_props($$props, { ref });
	});
}