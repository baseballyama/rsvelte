import * as $ from 'svelte/internal/server';
import { Rating, Heart } from "flowbite-svelte";

export default function IconAndSize($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const heartWrapper = (props) => (anchor, _props) => Heart(anchor, { ..._props, ...props });

		Rating($$renderer, {
			total: 5,
			rating: 3.3,
			size: 20,
			id: 'example-5',
			icon: Heart
		});

		$$renderer.push(`<!----> `);
		Rating($$renderer, { total: 10, rating: 7.6, id: 'example-5b', icon: Heart });
		$$renderer.push(`<!----> `);

		Rating($$renderer, {
			total: 10,
			rating: 7.6,
			id: 'example-5b',
			icon: heartWrapper({ fillColor: "#3752d6", strokeColor: "#3752d6" })
		});

		$$renderer.push(`<!---->`);
	});
}