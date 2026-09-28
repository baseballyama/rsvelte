import * as $ from 'svelte/internal/server';
import Child from './child.svelte';

export default function Main($$renderer) {
	Child($$renderer, { label: 'click me', onclick: () => console.log('worked') });
}