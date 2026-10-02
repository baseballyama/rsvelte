import * as $ from 'svelte/internal/server';

export default function Js_no_types_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;

		console.log(props.anything);
	});
}