import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import '../app.css';

var root = $.from_html(`<meta name="title" content="Svelte French Toast"/> <meta name="description" content="Buttery smooth toast notifications for Svelte. Lightweight, customizable, and beautiful by default."/> <meta property="og:type" content="website"/> <meta property="og:url" content="https://svelte-french-toast.com/"/> <meta property="og:title" content="Svelte French Toast"/> <meta property="og:description" content="Buttery smooth toast notifications for Svelte. Lightweight, customizable, and beautiful by default."/> <meta property="og:image" content="https://svelte-french-toast.com/og-image.png"/> <meta property="twitter:card" content="summary_large_image"/> <meta property="twitter:url" content="https://svelte-french-toast.com/"/> <meta property="twitter:title" content="Svelte French Toast"/> <meta property="twitter:description" content="Buttery smooth toast notifications for Svelte. Lightweight, customizable, and beautiful by default."/> <meta property="twitter:image" content="https://svelte-french-toast.com/og-image.png"/>`, 1);

export default function _layout($$anchor, $$props) {
	var fragment_1 = $.comment();

	$.head('12qhfyh', ($$anchor) => {
		var fragment = root();

		$.next(22);

		$.effect(() => {
			$.document.title = 'Svelte French Toast';
		});

		$.append($$anchor, fragment);
	});

	var node = $.first_child(fragment_1);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment_1);
}