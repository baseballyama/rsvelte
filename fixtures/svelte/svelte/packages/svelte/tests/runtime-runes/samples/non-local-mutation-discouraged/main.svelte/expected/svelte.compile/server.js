import * as $ from 'svelte/internal/server';
import Counter from './Counter.svelte';

export default function Main($$renderer) {
	let object = { count: 0 };

	Counter($$renderer, { object, reset: () => object = { count: 0 } });
}