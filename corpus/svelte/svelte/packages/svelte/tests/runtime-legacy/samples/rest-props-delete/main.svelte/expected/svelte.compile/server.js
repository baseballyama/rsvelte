import * as $ from 'svelte/internal/server';
import App from "./App.svelte";

export default function Main($$renderer) {
	App($$renderer, { a: 1, b: 2 });
}