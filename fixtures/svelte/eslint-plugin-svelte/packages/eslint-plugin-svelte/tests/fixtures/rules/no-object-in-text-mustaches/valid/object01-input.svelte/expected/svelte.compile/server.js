import * as $ from 'svelte/internal/server';
import MyComponent from './MyComponent.svelte';

export default function Object01_input($$renderer) {
	let a = 'hello!';

	MyComponent($$renderer, { prop: { a } });
}