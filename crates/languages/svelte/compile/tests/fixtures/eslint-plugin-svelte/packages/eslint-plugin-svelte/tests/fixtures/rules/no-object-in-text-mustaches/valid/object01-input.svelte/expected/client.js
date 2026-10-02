import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MyComponent from './MyComponent.svelte';

export default function Object01_input($$anchor) {
	let a = 'hello!';

	MyComponent($$anchor, { prop: { a } });
}