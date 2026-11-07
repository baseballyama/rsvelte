import * as $ from 'svelte/internal/server';

export default function Button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			href,
			type,
			children,
			disabled = false,
			ref = null,
			$$slots,
			$$events,
			...restProps
		} = $$props;

		$.element(
			$$renderer,
			href ? "a" : "button",
			() => {
				$$renderer.push(`${$.attributes({
					'data-button-root': true,
					type: href ? undefined : type,
					href: href && !disabled ? href : undefined,
					disabled: href ? undefined : disabled,
					'aria-disabled': href ? disabled : undefined,
					role: href && disabled ? "link" : undefined,
					tabindex: href && disabled ? -1 : 0,
					...restProps
				})}`);
			},
			() => {
				children?.($$renderer);
				$$renderer.push(`<!---->`);
			}
		);

		$.bind_props($$props, { ref });
	});
}