import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Nested from './Nested.svelte';
import Hello from './Hello.svelte';

export default function Main($$anchor) {
	let name = 'world';

	Nested($$anchor, {
		$$slots: {
			name: ($$anchor, $$slotProps) => {
				Hello($$anchor, { slot: 'name', name });
			}
		}
	});
}