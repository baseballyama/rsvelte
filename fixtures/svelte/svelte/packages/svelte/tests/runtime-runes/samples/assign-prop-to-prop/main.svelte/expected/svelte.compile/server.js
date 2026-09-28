import * as $ from 'svelte/internal/server';
import Test from './Test.svelte';

export default function Main($$renderer) {
	Test($$renderer, { a: 5 });
}