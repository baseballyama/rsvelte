import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';
import Hello from './Hello.svelte';
import World from './World.svelte';

export default function Main($$renderer) {
	Nested($$renderer, {
		$$slots: {
			name: ($$renderer) => {
				Hello($$renderer, { slot: 'name' });
			}
		}
	});

	$$renderer.push(`<!----> `);

	Nested($$renderer, {
		$$slots: {
			name: ($$renderer) => {
				World($$renderer, { slot: 'name' });
			}
		}
	});

	$$renderer.push(`<!---->`);
}