import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let to_check = "keep";

	$$renderer.push(`<input type="checkbox" name="lang" value="keep"${$.attr('checked', to_check === "keep", true)}/>`);
}