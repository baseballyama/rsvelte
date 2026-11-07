import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { $$slots, $$events, ...props } = $$props;
		const { model } = props;
		const value = props.model.value;

		console.log(model, value);
	});
}