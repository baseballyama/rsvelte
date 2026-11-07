import * as $ from 'svelte/internal/server';

export default function Builtin_types_unused_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;

		console.log(props.date.getTime());
	});
}