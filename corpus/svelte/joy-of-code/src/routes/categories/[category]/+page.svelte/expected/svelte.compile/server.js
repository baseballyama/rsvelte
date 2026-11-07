import * as $ from 'svelte/internal/server';
import { page } from '$app/stores';
import Heading from '$lib/ui/heading.svelte';
import Posts from '$lib/ui/posts.svelte';
import * as config from '$lib/site/config';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { data } = $$props;
		const posts = $.derived(() => data.posts);
		const category = $.store_get($$store_subs ??= {}, '$page', page).params.category;

		$.head('j39hja', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(config.categories[category])}</title>`);
			});

			$$renderer.push(`<meta${$.attr('content', `${$.stringify(config.categories[category])} category.`)} name="description"/>`);
		});

		Heading($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(config.categories[category])}`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		{
			function title($$renderer) {
				$$renderer.push(`<div class="container svelte-j39hja"><div><span class="tag svelte-j39hja">${$.escape(category)}</span></div> <div><span class="results svelte-j39hja">${$.escape(posts().length)}</span> results</div></div>`);
			}

			Posts($$renderer, { posts: posts(), title, $$slots: { title: true } });
		}

		$$renderer.push(`<!---->`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}