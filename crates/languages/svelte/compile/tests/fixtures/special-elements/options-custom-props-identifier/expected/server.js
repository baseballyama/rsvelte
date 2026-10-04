import * as $ from 'svelte/internal/server';

export default function Options_custom_props_identifier($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...props } = $$props;
		$$renderer.push(`<p>${$.escape(props.value)}</p>`);
	});
}
