import * as $ from 'svelte/internal/server';
import { make, apply } from '@svelte-put/preaction';

export default function Demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// :::highlight
		// :::
		const popover = {
			// :::highlight
			control: make((id) => {
				// :::
				return {
					action: (node) => {
						// regular runtime Svelte action business
						console.log('popover control', node);
					},

					attributes: {
						popovertarget: id,
						class: 'c-btn',
						popovertargetaction: 'show'
					}
				};
			}),

			// :::highlight
			target: make((id) => {
				// :::
				return {
					action: (node) => {
						// regular runtime Svelte action business
						console.log('popover target', node);
					},
					attributes: { id, class: 'border-2 p-10 m-auto', popover: 'auto' }
				};
			})
		};

		$$renderer.push(`<button>Open Popover</button> <div>My simple popover</div>`);
	});
}