import * as $ from 'svelte/internal/server';

export default function Recursive_type_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;

		console.log(props.value, props.children?.[0]?.value);
	});
}