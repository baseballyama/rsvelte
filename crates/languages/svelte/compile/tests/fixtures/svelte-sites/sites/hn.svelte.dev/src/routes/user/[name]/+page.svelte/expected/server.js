import * as $ from 'svelte/internal/server';
import SubsetHTML from '$lib/SubsetHTML.svelte';
import { timeAgo } from '$lib/utils';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = $$props;

		const user = $.derived(() => data.user),
			now = $.derived(() => data.now);

		$.head('1qch8zw', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(user().id)} • Svelte Hacker News</title>`);
			});
		});

		$$renderer.push(`<h1>${$.escape(user().id)}</h1> <div><p>...joined <strong>${$.escape(timeAgo(now() - user().created))}</strong>, and has <strong>${$.escape(user().karma)}</strong> karma</p> <p><a rel="external"${$.attr('href', `https://news.ycombinator.com/submitted?id=${$.stringify(user().id)}`)}>submissions</a> / <a rel="external"${$.attr('href', `https://news.ycombinator.com/threads?id=${$.stringify(user().id)}`)}>comments</a> / <a rel="external"${$.attr('href', `https://news.ycombinator.com/favorites?id=${$.stringify(user().id)}`)}>favourites</a></p> `);

		if (user().about) {
			$$renderer.push(`<!--[0--><div class="about">`);
			SubsetHTML($$renderer, { content: user().about });
			$$renderer.push(`<!----></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}