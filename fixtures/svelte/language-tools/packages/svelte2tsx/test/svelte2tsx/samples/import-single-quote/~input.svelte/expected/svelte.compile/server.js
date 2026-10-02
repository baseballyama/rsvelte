import * as $ from 'svelte/internal/server';
import Test from './Test.svelte';

export default function Input($$renderer) {
	Test($$renderer, { b: '6' });
}