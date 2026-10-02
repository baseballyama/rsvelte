import * as $ from 'svelte/internal/server';

export default function Ignored_type_patterns_custom_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;

		console.log(props.id, props.name);
	});
}