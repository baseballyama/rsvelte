import * as $ from 'svelte/internal/server';
import Counter from './Counter.svelte';

function foo($$renderer) {
	$$renderer.push(`<p>foo</p>`);
}

export default function Main($$renderer) {
	Counter($$renderer, { foo });
}