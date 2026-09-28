import * as $ from 'svelte/internal/server';
import { createContext } from 'svelte';

const [get] = createContext();

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		get();
	});
}