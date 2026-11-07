import * as $ from 'svelte/internal/server';
import { writable } from "svelte/store";

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const foo = writable(1);
	});
}