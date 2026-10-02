import * as $ from 'svelte/internal/server';

export default function Extends_unused_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { $$slots, $$events, ...props } = $$props;

		console.log(props.id, props.type, props.name);
	});
}