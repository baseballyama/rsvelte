import * as $ from 'svelte/internal/server';

export default function Component($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;

		// svelte-ignore state_referenced_locally
		const name = props.name;

		$.bind_props($$props, { name });
	});
}