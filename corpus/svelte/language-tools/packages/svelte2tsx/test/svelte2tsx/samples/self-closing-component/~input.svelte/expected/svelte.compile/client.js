import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Test from './Test.svelte';

export default function Input($$anchor) {
	let a = 'b';

	Test($$anchor, { b: '6' });
}