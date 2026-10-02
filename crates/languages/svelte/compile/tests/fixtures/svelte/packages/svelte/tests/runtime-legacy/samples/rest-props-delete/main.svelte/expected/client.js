import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import App from "./App.svelte";

export default function Main($$anchor) {
	App($$anchor, { a: 1, b: 2 });
}