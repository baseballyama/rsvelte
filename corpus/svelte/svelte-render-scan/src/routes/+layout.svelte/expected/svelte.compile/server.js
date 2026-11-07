import * as $ from 'svelte/internal/server';
import '../app.css';

export default function _layout($$renderer, $$props) {
	let { children } = $$props;
	const SITE_URL = 'https://khromov.github.io/svelte-render-scan/';

	$.head('12qhfyh', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Svelte Render Scan</title>`);
		});

		$$renderer.push(`<meta name="title" content="Svelte Render Scan"/> <meta name="description" content="Visual debugging for Svelte apps."/> <meta property="og:type" content="website"/> <meta property="og:url"${$.attr('content', SITE_URL)}/> <meta property="og:title" content="Svelte Render Scan"/> <meta property="og:description" content="Visual debugging for Svelte apps."/> <meta property="og:image"${$.attr('content', `${SITE_URL}og-image.jpg`)}/> <meta property="og:image:width" content="1200"/> <meta property="og:image:height" content="630"/> <meta property="twitter:card" content="summary_large_image"/> <meta property="twitter:url"${$.attr('content', SITE_URL)}/> <meta property="twitter:title" content="Svelte Render Scan"/> <meta property="twitter:description" content="Visual debugging for Svelte apps."/> <meta property="twitter:image"${$.attr('content', `${SITE_URL}/og-image.png`)}/>`);
	});

	children($$renderer);
	$$renderer.push(`<!---->`);
}