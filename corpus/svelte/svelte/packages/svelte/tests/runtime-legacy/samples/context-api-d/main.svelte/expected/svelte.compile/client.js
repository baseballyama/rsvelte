import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';
import Leaf from './Leaf.svelte';

export default function Main($$anchor) {
	Nested($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Leaf($$anchor, {});
		},
		$$slots: { default: true }
	});
}