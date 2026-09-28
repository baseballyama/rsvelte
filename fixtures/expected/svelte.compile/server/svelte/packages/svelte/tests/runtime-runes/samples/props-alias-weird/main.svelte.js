import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	Child($$renderer, { '0': 0, 'ysc%%gibberish': 1 });
}