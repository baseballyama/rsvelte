import * as $ from 'svelte/internal/server';
import Inner from "./Inner.svelte";

export default function Main($$renderer) {
	let value = '';

	$$renderer.push(`<input${$.attr('value', value)}/> `);
	Inner($$renderer, { value });
	$$renderer.push(`<!---->`);
}