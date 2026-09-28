import * as $ from 'svelte/internal/server';
import Counter from './Counter.svelte';

function foo($$renderer, n) {
	$$renderer.push(`<p>clicks: ${$.escape(n)}</p>`);
}

export default function Main($$renderer) {
	Counter($$renderer, { foo });
}