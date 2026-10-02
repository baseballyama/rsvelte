import * as $ from 'svelte/internal/server';
import { foo } from './bar.js';
import { baz } from './bar';

export default function Other($$renderer) {
	// valid
	// invalid
	foo;

	baz;
}