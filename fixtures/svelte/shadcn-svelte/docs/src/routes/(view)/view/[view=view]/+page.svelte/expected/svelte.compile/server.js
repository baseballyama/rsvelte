import * as $ from 'svelte/internal/server';
import Metadata from "$lib/components/metadata.svelte";
import { cn } from "$lib/utils.js";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		Metadata($$renderer, {
			title: data.meta.name,
			description: data.meta.description,
			ogImage: {
				url: `/og?title=${encodeURIComponent(data.meta.name)}&description=${encodeURIComponent(data.meta.description)}`
			},
			ogType: 'article'
		});

		$$renderer.push(`<!----> <div${$.attr_class($.clsx(cn("bg-background", data.meta?.className)))}>`);

		if (data.component) {
			$$renderer.push('<!--[-->');
			data.component($$renderer, {});
			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	});
}