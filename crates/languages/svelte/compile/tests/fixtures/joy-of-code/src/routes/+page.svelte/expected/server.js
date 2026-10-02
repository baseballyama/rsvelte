import * as $ from 'svelte/internal/server';
import Newsletter from '$lib/ui/newsletter.svelte';
import Posts from '$lib/ui/posts.svelte';
import { ArrowRight } from '$lib/icons';
import * as config from '$lib/site/config';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const posts = $.derived(() => data.posts);

		$.head('1uha8ag', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(config.siteTitle)}</title>`);
			});

			$$renderer.push(`<meta${$.attr('content', config.siteDescription)} name="description"/> <meta${$.attr('content', config.siteTitle)} property="og:title"/> <meta${$.attr('content', config.siteImage)} property="og:image"/> <meta${$.attr('content', config.siteUrl)} property="og:url"/> <meta${$.attr('content', config.siteDescription)} property="og:description"/> <meta${$.attr('content', config.siteName)} property="og:site_name"/> <meta${$.attr('content', config.twitterHandle)} name="twitter:creator"/> <meta content="summary_large_image" name="twitter:card"/> <meta${$.attr('content', config.siteTitle)} name="twitter:title"/> <meta${$.attr('content', config.siteDescription)} name="twitter:description"/> <meta${$.attr('content', config.siteImage)} name="twitter:image"/>`);
		});

		$$renderer.push(`<main><section class="hero svelte-1uha8ag"><div class="latest-post svelte-1uha8ag"><h1 class="title svelte-1uha8ag">${$.escape(posts()[0].title)}</h1> <p class="description svelte-1uha8ag">${$.escape(posts()[0].description)}</p> <a class="continue-reading svelte-1uha8ag"${$.attr('href', posts()[0].slug)}><span>Continue reading</span> `);
		ArrowRight($$renderer, { width: 24, height: 24, 'aria-hidden': true });
		$$renderer.push(`<!----></a></div> <div class="divider svelte-1uha8ag"></div> <div class="newsletter svelte-1uha8ag"><h2 class="svelte-1uha8ag">Subscribe for updates</h2> `);
		Newsletter($$renderer, {});
		$$renderer.push(`<!----></div></section> `);

		{
			function title($$renderer) {
				$$renderer.push(`<h3 class="latest svelte-1uha8ag">Latest</h3>`);
			}

			function more($$renderer) {
				$$renderer.push(`<a href="/archive"><span>See more posts</span> `);
				ArrowRight($$renderer, { width: '24', height: '24', 'aria-hidden': 'true' });
				$$renderer.push(`<!----></a>`);
			}

			Posts($$renderer, {
				posts: posts(),
				title,
				more,
				$$slots: { title: true, more: true }
			});
		}

		$$renderer.push(`<!----></main>`);
	});
}