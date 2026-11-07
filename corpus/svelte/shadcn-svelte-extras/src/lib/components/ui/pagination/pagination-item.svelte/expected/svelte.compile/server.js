import * as $ from 'svelte/internal/server';

export default function Pagination_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<li${$.attributes({ 'data-slot': 'pagination-item', ...restProps })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></li>`);
		$.bind_props($$props, { ref });
	});
}