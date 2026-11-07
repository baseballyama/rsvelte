import * as $ from 'svelte/internal/server';

export default function New_expression_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;

		new props.config();
	});
}