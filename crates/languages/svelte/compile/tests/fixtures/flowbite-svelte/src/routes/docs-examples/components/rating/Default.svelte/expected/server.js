import * as $ from 'svelte/internal/server';
import { Rating, Star } from "flowbite-svelte";

export default function Default($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const wrapper = (props) => (anchor, _props) => Star(anchor, { ..._props, ...props });

		Rating($$renderer, { id: 'example-1', total: 5, size: 50, rating: 1.4 });
		$$renderer.push(`<!----> `);
		Rating($$renderer, { id: 'example-1b', total: 5, size: 50, rating: 4.66 });
		$$renderer.push(`<!----> `);

		Rating($$renderer, {
			id: 'example-1b',
			icon: wrapper({ fillColor: "#008800", strokeColor: "#008800" }),
			total: 5,
			size: 50,
			rating: 4.66
		});

		$$renderer.push(`<!---->`);
	});
}