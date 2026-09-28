import * as $ from 'svelte/internal/server';
import { page } from "$app/state";
import { siteConfig } from "$lib/config.js";

export default function Metadata($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			title,
			ogImage,
			description,
			keywords = siteConfig.keywords,
			ogType = "website"
		} = $$props;

		const ogUrl = $.derived(() => {
			if (!ogImage?.url) return siteConfig.ogImage.url;
			if (ogImage.url.startsWith("/")) return siteConfig.url + ogImage.url;

			return ogImage.url;
		});

		const ogWidth = $.derived(() => {
			if (ogImage?.width) return ogImage.width;

			return siteConfig.ogImage.width;
		});

		const ogHeight = $.derived(() => {
			if (ogImage?.height) return ogImage.height;

			return siteConfig.ogImage.height;
		});

		const trueTitle = $.derived(() => title === siteConfig.name ? siteConfig.name : `${title} - ${siteConfig.name}`);

		$.head('5v2rt', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${$.escape(trueTitle())}</title>`);
			});

			$$renderer.push(`<meta name="description"${$.attr('content', description)}/> <meta name="keywords"${$.attr('content', keywords?.join(","))}/> <meta name="author" content="huntabyte"/> <meta name="creator" content="huntabyte"/> <meta name="twitter:card" content="summary_large_image"/> <meta name="twitter:site"${$.attr('content', siteConfig.url)}/> <meta name="twitter:title"${$.attr('content', title)}/> <meta name="twitter:description"${$.attr('content', description)}/> <meta name="twitter:image"${$.attr('content', ogUrl())}/> <meta name="twitter:image:alt"${$.attr('content', title)}/> <meta name="twitter:creator" content="@huntabyte"/> <meta property="og:title"${$.attr('content', title)}/> <meta property="og:type"${$.attr('content', ogType)}/> <meta property="og:url"${$.attr('content', siteConfig.url + page.url.pathname)}/> <meta property="og:image"${$.attr('content', ogUrl())}/> <meta property="og:image:alt"${$.attr('content', title)}/> <meta property="og:image:width"${$.attr('content', ogWidth())}/> <meta property="og:image:height"${$.attr('content', ogHeight())}/> <meta property="og:description"${$.attr('content', description)}/> <meta property="og:site_name"${$.attr('content', siteConfig.name)}/> <meta property="og:locale" content="EN_US"/>`);
		});
	});
}