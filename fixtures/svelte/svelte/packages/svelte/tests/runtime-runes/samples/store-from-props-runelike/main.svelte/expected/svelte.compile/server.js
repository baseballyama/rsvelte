import * as $ from 'svelte/internal/server';
import { writable } from "svelte/store";
import Child from "./child.svelte";

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const state = writable(0);

		Child($$renderer, { state });
	});
}