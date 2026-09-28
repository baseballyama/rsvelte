import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import { useSiteConfig } from "$lib/utils/use-site-config.svelte.js";

export default function Metadata($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const siteConfig = useSiteConfig();

		let {
			title = siteConfig.current.name,
			ogImage = siteConfig.current.ogImage,
			description = siteConfig.current.description,
			keywords = siteConfig.current.keywords
		} = $$props;

		const trueTitle = $.derived(() => title === siteConfig.current.name
			? siteConfig.current.name
			: `${title} - ${siteConfig.current.name}`);

		$.head('5v2rt', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(trueTitle())}</title>`);
			});

			$$renderer.push(`<meta name="description"${$.attr('content', description)}/> <meta name="keywords"${$.attr('content', keywords?.join(","))}/> <meta name="author" content="huntabyte"/> <meta name="twitter:card" content="summary_large_image"/> <meta name="twitter:site"${$.attr('content', siteConfig.current.url)}/> <meta name="twitter:title"${$.attr('content', title)}/> <meta name="twitter:description"${$.attr('content', description)}/> <meta name="twitter:image"${$.attr('content', ogImage?.url)}/> <meta name="twitter:image:alt"${$.attr('content', title)}/> <meta name="twitter:creator" content="huntabyte"/> <meta property="og:title"${$.attr('content', title)}/> <meta property="og:type" content="website"/> <meta property="og:url"${$.attr('content', siteConfig.current.url + page.url.pathname)}/> <meta property="og:image"${$.attr('content', ogImage?.url)}/> <meta property="og:image:alt"${$.attr('content', title)}/> <meta property="og:image:width"${$.attr('content', ogImage?.width)}/> <meta property="og:image:height"${$.attr('content', ogImage?.height)}/> <meta property="og:description"${$.attr('content', description)}/> <meta property="og:site_name"${$.attr('content', siteConfig.current.name)}/> <meta property="og:locale" content="EN_US"/>`);
		});
	});
}