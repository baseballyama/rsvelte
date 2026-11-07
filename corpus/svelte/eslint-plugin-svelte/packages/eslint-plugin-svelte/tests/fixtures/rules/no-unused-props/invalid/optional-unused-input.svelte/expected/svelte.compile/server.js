import * as $ from 'svelte/internal/server';

export default function Optional_unused_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;

		console.log(props.required);

		if (props.optional !== undefined) {
			console.log(props.optional);
		}
	});
}