import * as $ from 'svelte/internal/server';

export default function Sidebar_menu_sub_item($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<li${$.attributes({ 'data-sidebar': 'menu-sub-item', ...restProps })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></li>`);
		$.bind_props($$props, { ref });
	});
}