import * as $ from 'svelte/internal/server';

export default function Ts_shorthand_attr01_type_output($$renderer) {
	const src = 'Hello'; // src: "Hello"

	$$renderer.push(`<img${$.attr('src', src)} alt="foo"/> <img${$.attr('src', src)} alt="foo"/>`);
}