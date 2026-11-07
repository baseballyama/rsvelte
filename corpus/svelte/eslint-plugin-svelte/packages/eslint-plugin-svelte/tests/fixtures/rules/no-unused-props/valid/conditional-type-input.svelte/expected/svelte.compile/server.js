import * as $ from 'svelte/internal/server';

export default function Conditional_type_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;

		console.log(props.value.length);

		if (props.isString) {
			console.log(props.converted.toUpperCase());
		}
	});
}