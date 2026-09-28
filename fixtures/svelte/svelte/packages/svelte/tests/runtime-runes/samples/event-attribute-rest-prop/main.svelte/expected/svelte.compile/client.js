import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './child.svelte';

export default function Main($$anchor) {
	Child($$anchor, { label: 'click me', onclick: () => console.log('worked') });
}