import * as $ from 'svelte/internal/server';
import { foo } from './bar.js';
import Other from './other.svelte';
import { baz } from './bar';

export default function Input($$renderer) {
	// valid
	// invalid
	foo;

	baz;
	Other;
}