import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import '../app.css';

var root = $.from_html(`<meta name="title" content="Svelte Render Scan"/> <meta name="description" content="Visual debugging for Svelte apps."/> <meta property="og:type" content="website"/> <meta property="og:url"/> <meta property="og:title" content="Svelte Render Scan"/> <meta property="og:description" content="Visual debugging for Svelte apps."/> <meta property="og:image"/> <meta property="og:image:width" content="1200"/> <meta property="og:image:height" content="630"/> <meta property="twitter:card" content="summary_large_image"/> <meta property="twitter:url"/> <meta property="twitter:title" content="Svelte Render Scan"/> <meta property="twitter:description" content="Visual debugging for Svelte apps."/> <meta property="twitter:image"/>`, 1);

export default function _layout($$anchor, $$props) {
	const SITE_URL = 'https://khromov.github.io/svelte-render-scan/';
	var fragment_1 = $.comment();

	$.head('12qhfyh', ($$anchor) => {
		var fragment = root();
		var meta = $.sibling($.first_child(fragment), 6);

		$.set_attribute(meta, 'content', SITE_URL);

		var meta_1 = $.sibling(meta, 6);

		$.set_attribute(meta_1, 'content', `${SITE_URL}og-image.jpg`);

		var meta_2 = $.sibling(meta_1, 8);

		$.set_attribute(meta_2, 'content', SITE_URL);

		var meta_3 = $.sibling(meta_2, 6);

		$.set_attribute(meta_3, 'content', `${SITE_URL}/og-image.png`);

		$.effect(() => {
			$.document.title = 'Svelte Render Scan';
		});

		$.append($$anchor, fragment);
	});

	var node = $.first_child(fragment_1);

	$.snippet(node, () => $$props.children);
	$.append($$anchor, fragment_1);
}