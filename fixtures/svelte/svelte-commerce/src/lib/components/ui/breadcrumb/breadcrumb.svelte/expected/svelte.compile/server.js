import * as $ from 'svelte/internal/server';

export default function Breadcrumb($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			ref = void 0,
			class: className,
			children,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$$renderer.push(`<nav${$.attributes({
			class: $.clsx(className),
			'aria-label': 'breadcrumb',
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></nav>`);
		$.bind_props($$props, { ref });
	});
}