import * as $ from 'svelte/internal/server';

export default function Union_type_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;

		if (props.status === 'success') {
			console.log(props.data);
		}
	});
}