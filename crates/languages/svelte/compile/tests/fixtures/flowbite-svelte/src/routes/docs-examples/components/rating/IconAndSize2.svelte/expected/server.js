import * as $ from 'svelte/internal/server';
import { Rating, Thumbup } from "flowbite-svelte";

export default function IconAndSize2($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const thumbWrapper = (props) => (anchor, _props) => Thumbup(anchor, { ..._props, ...props });

		Rating($$renderer, {
			total: 5,
			rating: 4.7,
			size: 20,
			id: 'example-5d',
			icon: Thumbup
		});

		$$renderer.push(`<!----> `);
		Rating($$renderer, { total: 10, rating: 8.2, id: 'example-5e', icon: Thumbup });
		$$renderer.push(`<!----> `);

		Rating($$renderer, {
			total: 10,
			rating: 7.6,
			id: 'example-5b',
			icon: thumbWrapper({ fillColor: "#ff3f00", strokeColor: "#ff3f00" })
		});

		$$renderer.push(`<!---->`);
	});
}