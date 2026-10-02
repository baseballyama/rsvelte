import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { foo } from './bar.js';
import Other from './other.svelte';
import { baz } from './bar';

export default function Input($$anchor) {
	// valid
	// invalid
	foo;

	baz;
	Other;
}