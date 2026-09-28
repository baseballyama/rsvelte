import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import "../app.css";
import Analytics from "../docs/ui/analytics/analytics.svelte";

var root = $.from_html(`<meta name="title" content="Kampsy-ui | A Svelte 5 component library"/> <meta name="description" content="Kampsy-ui - A Svelte 5 component library, thoughtfully designed to deliver consistent and cohesive web experiences."/> <meta property="og:type" content="website"/> <meta property="og:url" content="https://ui.kampsy.xyz"/> <meta property="og:title" content="Kampsy-ui | A Svelte 5 component library"/> <meta property="og:description" content="Kampsy-ui - A Svelte 5 component library, thoughtfully designed to deliver consistent and cohesive web experiences."/> <meta property="og:image" content="https://ucarecdn.com/91722eb1-c95a-42b2-b851-cdfe01a9bdf7/-/preview/1200x628/"/> <meta property="twitter:card" content="summary_large_image"/> <meta property="twitter:url" content="https://ui.kampsy.xyz"/> <meta property="twitter:title" content="Kampsy-ui | A Svelte 5 component library"/> <meta property="twitter:description" content="Kampsy-ui - A Svelte 5 component library, thoughtfully designed to deliver consistent and cohesive web experiences."/> <meta property="twitter:image" content="https://ucarecdn.com/91722eb1-c95a-42b2-b851-cdfe01a9bdf7/-/preview/1200x628/"/> <meta name="robots" content="index, follow"/>`, 1);

var root_1 = $.from_html(`<main class="ui-scrollbar font-inter bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary min-h-screen overflow-x-hidden
		md:overflow-x-visible"><!></main>`);

export default function _layout($$anchor, $$props) {
	$.head('12qhfyh', ($$anchor) => {
		var fragment = root();

		$.next(24);
		$.append($$anchor, fragment);
	});

	Analytics($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var main = root_1();
			var node = $.child(main);

			$.snippet(node, () => $$props.children);
			$.reset(main);
			$.append($$anchor, main);
		},
		$$slots: { default: true }
	});
}