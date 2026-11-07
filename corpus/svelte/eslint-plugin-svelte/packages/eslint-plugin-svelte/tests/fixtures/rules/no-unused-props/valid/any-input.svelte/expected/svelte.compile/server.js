import * as $ from 'svelte/internal/server';

export default function Any_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// There is no type annotation, so it is treated as any.
		let { $$slots, $$events, ...props } = $$props;

		console.log(props.anything);
	});
}