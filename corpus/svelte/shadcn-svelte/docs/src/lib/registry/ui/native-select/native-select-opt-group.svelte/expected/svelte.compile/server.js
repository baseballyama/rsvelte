import * as $ from 'svelte/internal/server';

export default function Native_select_opt_group($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { ref = null, children, $$slots, $$events, ...restProps } = $$props;

		$$renderer.push(`<optgroup${$.attributes({ 'data-slot': 'native-select-opt-group', ...restProps })}>`);
		children?.($$renderer);
		$$renderer.push(`<!----><!></optgroup>`);
		$.bind_props($$props, { ref });
	});
}