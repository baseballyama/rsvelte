import * as $ from 'svelte/internal/server';
import Button from "./Button.svelte";

export default function Main($$renderer) {
	const attrs = {};

	Object.defineProperty(attrs, "data-attr", { value: "", enumerable: true });
	$$renderer.push(`<button${$.attributes({ ...attrs })}>Hello world</button> `);
	Button($$renderer, $.spread_props([attrs]));
	$$renderer.push(`<!---->`);
}