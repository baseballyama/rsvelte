import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

class MyClass {
	constructor() {
		onMount(() => console.log('mounted'));
	}
}

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		new MyClass();
	});
}