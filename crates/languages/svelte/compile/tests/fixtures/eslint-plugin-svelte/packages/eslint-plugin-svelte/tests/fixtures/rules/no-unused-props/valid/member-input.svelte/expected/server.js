import * as $ from 'svelte/internal/server';

export default function Member_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...props } = $$props;

		console.log(props.a, props.b);
	});
}