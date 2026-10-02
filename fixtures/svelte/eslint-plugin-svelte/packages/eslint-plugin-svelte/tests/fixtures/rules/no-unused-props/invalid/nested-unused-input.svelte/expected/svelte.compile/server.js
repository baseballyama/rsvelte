import * as $ from 'svelte/internal/server';

export default function Nested_unused_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...props } = $$props;

		console.log(props.user.name);
	});
}