import * as $ from 'svelte/internal/server';

export default function A($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { children, $$slots, $$events, ...rest } = $$props;
		const isExternal = $.derived(() => rest.href && !rest.href.startsWith('/') && !rest.href.startsWith('#'));

		$$renderer.push(`<a${$.attributes({
			class: 'anchor',
			target: isExternal() ? '_blank' : undefined,
			rel: isExternal() ? 'noopener noreferrer' : undefined,
			...rest
		})}>`);

		children?.($$renderer);
		$$renderer.push(`<!----></a>`);
	});
}