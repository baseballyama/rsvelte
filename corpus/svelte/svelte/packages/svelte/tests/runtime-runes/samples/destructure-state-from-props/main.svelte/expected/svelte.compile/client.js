import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Child from './Child.svelte';

export default function Main($$anchor) {
	Child($$anchor, { data: { foo: 'bar' } });
}