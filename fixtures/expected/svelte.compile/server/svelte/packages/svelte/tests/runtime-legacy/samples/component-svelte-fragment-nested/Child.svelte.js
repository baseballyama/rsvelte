import * as $ from 'svelte/internal/server';
import Nested from './Nested.svelte';

export default function Child($$renderer, $$props) {
	Nested($$renderer, {
		$$slots: {
			name: ($$renderer) => {
				{
					$$renderer.push(`<!--[-->`);
					$.slot($$renderer, $$props, 'default', {}, null);
					$$renderer.push(`<!--]-->`);
				}
			}
		}
	});

	$$renderer.push(`<!----> `);

	Nested($$renderer, {
		$$slots: {
			name: ($$renderer) => {
				{
					$$renderer.push(`<!--[-->`);
					$.slot($$renderer, $$props, 'b', {}, null);
					$$renderer.push(`<!--]-->`);
				}
			}
		}
	});

	$$renderer.push(`<!---->`);
}