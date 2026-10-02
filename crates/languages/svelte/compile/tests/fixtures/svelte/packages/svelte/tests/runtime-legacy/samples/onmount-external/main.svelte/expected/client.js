import 'svelte/internal/disclose-version';
import { onMount } from 'svelte';
import * as $ from 'svelte/internal/client';

class MyClass {
	constructor() {
		onMount(() => console.log('mounted'));
	}
}

export default function Main($$anchor, $$props) {
	$.push($$props, true);
	new MyClass();
	$.pop();
}