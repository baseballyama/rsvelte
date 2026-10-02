import * as $ from 'svelte/internal/server';

export default function Intersection_type_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;

		console.log(props.id, props.name, props.createdAt.getTime(), props.updatedAt.getTime());
	});
}