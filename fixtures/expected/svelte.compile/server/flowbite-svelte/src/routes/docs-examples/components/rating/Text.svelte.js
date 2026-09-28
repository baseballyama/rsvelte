import * as $ from 'svelte/internal/server';
import { Rating, Star } from "flowbite-svelte";

export default function Text($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const wrapper = (props) => (anchor, _props) => Star(anchor, { ..._props, ...props });

		{
			function text($$renderer) {
				$$renderer.push(`<p class="ms-2 text-sm font-medium text-gray-500 dark:text-gray-400">3.4 out of 5</p>`);
			}

			Rating($$renderer, {
				id: 'example-3a',
				total: 5,
				rating: 3.4,
				text,
				$$slots: { text: true }
			});
		}

		$$renderer.push(`<!----> `);

		{
			function text($$renderer) {
				$$renderer.push(`<p class="ms-2 text-sm font-medium text-gray-500 dark:text-gray-400">2.8 out of 5</p>`);
			}

			Rating($$renderer, {
				id: 'example-3',
				total: 5,
				rating: 2.8,
				icon: wrapper({ fillColor: "#008800", strokeColor: "#008800" }),
				text,
				$$slots: { text: true }
			});
		}

		$$renderer.push(`<!---->`);
	});
}