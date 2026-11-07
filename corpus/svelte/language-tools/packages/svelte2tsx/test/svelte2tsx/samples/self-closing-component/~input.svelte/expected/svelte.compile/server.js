import * as $ from 'svelte/internal/server';
import Test from './Test.svelte';

export default function Input($$renderer) {
	let a = 'b';

	Test($$renderer, { b: '6' });
}