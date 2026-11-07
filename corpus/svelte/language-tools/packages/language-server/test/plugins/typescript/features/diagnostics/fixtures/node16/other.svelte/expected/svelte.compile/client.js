import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { foo } from './bar.js';
import { baz } from './bar';

export default function Other($$anchor) {
	// valid
	// invalid
	foo;

	baz;
}