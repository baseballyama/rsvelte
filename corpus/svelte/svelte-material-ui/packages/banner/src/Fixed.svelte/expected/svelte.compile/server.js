import * as $ from 'svelte/internal/server';

export default function Fixed($$renderer, $$props) {
	let {
		fixed = false,
		width,
		children,
		$$slots,
		$$events,
		...restProps
	} = $$props;

	let element = void 0;

	function getElement() {
		return element;
	}

	if (fixed) {
		$$renderer.push(`<!--[0--><div${$.attributes({
			class: 'mdc-banner__fixed',
			style: width == null ? undefined : `width: ${width}px;`,
			...restProps
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
		children?.($$renderer);
		$$renderer.push(`<!---->`);
	}

	$$renderer.push(`<!--]-->`);
	$.bind_props($$props, { getElement });
}