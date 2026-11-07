import * as $ from 'svelte/internal/server';

export default function Typed_props_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...props } = $$props;

		console.log(props.name, props.age);
	});
}