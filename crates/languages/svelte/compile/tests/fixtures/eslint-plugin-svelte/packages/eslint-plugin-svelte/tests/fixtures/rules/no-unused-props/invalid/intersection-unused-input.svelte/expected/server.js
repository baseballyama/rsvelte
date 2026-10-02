import * as $ from 'svelte/internal/server';

export default function Intersection_unused_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;

		console.log(props.id, props.name, props.createdAt);
	});
}