import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/state";
import { MetaTags } from "svelte-meta-tags";

var root = $.from_html(`<meta name="keywords"/>`);
var root_1 = $.from_html(`<meta name="robots" content="noindex, nofollow"/>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function SEO($$anchor, $$props) {
	$.push($$props, true);

	let noindex = $.prop($$props, 'noindex', 3, false);
	let resolvedCanonical = $.derived(() => $$props.canonical ?? `${page.url.origin}${page.url.pathname}`);

	let resolvedImages = $.derived(() => $$props.images && $$props.images.length > 0
		? $$props.images
		: [
			{
				url: `${page.url.origin}/og.png`,
				width: 1200,
				height: 630,
				alt: "Svelte Marketing Blocks"
			}
		]);

	$.head('skm2cu', ($$anchor) => {
		var fragment = root_2();
		var node = $.first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var meta = root();

				$.template_effect(($0) => $.set_attribute(meta, 'content', $0), [() => $$props.keywords.join(", ")]);
				$.append($$anchor, meta);
			};

			$.if(node, ($$render) => {
				if ($$props.keywords?.length) $$render(consequent);
			});
		}

		var node_1 = $.sibling(node, 2);

		{
			var consequent_1 = ($$anchor) => {
				var meta_1 = root_1();

				$.append($$anchor, meta_1);
			};

			$.if(node_1, ($$render) => {
				if (noindex()) $$render(consequent_1);
			});
		}

		$.append($$anchor, fragment);
	});

	{
		let $0 = $.derived(() => ({
			url: $.get(resolvedCanonical),
			title: $$props.title,
			description: $$props.description,
			images: $.get(resolvedImages),
			siteName: "Svelte Marketing Blocks"
		}));

		let $1 = $.derived(() => ({
			creator: "@Sikandar_Bhide",
			site: "@Sikandar_Bhide",
			cardType: "summary_large_image",
			title: $$props.title,
			description: $$props.description,
			image: $.get(resolvedImages)[0]?.url,
			imageAlt: $.get(resolvedImages)[0]?.alt ?? "Svelte Marketing Blocks"
		}));

		MetaTags($$anchor, {
			get title() {
				return $$props.title;
			},
			titleTemplate: '%s - Svelte Marketing Blocks',
			get description() {
				return $$props.description;
			},

			get canonical() {
				return $.get(resolvedCanonical);
			},

			get openGraph() {
				return $.get($0);
			},

			get twitter() {
				return $.get($1);
			}
		});
	}

	$.pop();
}