import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Main($$renderer) {
	Nested($$renderer, {
		$$slots: {
			name: ($$renderer) => {
				{
					$$renderer.push(`<span>Hello</span>`);
				}
			}
		}
	});

	$$renderer.push(`<!----> `);

	Nested($$renderer, {
		$$slots: {
			name: ($$renderer) => {
				{
					$$renderer.push(`<span>world</span>`);
				}
			}
		}
	});

	$$renderer.push(`<!---->`);
}