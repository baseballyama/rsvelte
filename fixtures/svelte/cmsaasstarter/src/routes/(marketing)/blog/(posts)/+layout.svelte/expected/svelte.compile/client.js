import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from "$app/stores";
import { error } from "@sveltejs/kit";
import { sortedBlogPosts } from "./../posts";
import { WebsiteName } from "../../../../config";

var root = $.from_html(`<meta name="description"/> <meta property="og:title"/> <meta property="og:description"/> <meta property="og:site_name"/> <meta property="og:url"/>  <meta name="twitter:card" content="summary"/> <meta name="twitter:title"/> <meta name="twitter:description"/>  <!>`, 1);
var root_1 = $.from_html(`<article class="prose mx-auto py-12 px-6 font-sans"><div class="text-sm text-accent"> </div> <h1> </h1> <!></article>`);

export default function _layout($$anchor, $$props) {
	$.push($$props, true);

	const $page = () => $.store_get(page, '$page', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	function getCurrentPost(url) {
		let searchPost = null;

		for (const post of sortedBlogPosts) {
			if (url == post.link || url == post.link + "/") {
				searchPost = post;

				continue;
			}
		}

		if (!searchPost) {
			error(404, "Blog post not found");
		}

		return searchPost;
	}

	let currentPost = $.derived(() => getCurrentPost($page().url.pathname));

	function buildLdJson(post) {
		return {
			"@context": "https://schema.org",
			"@type": "BlogPosting",
			headline: post.title,
			datePublished: post.parsedDate?.toISOString(),
			dateModified: post.parsedDate?.toISOString()
		};
	}

	let jsonldScript = $.derived(() => `<script type="application/ld+json">${JSON.stringify(buildLdJson($.get(currentPost))) + "<"}/script>`);
	let pageUrl = $.derived(() => $page().url.origin + $page().url.pathname);
	var article = root_1();

	$.head('1lsl30p', ($$anchor) => {
		var fragment = root();
		var meta = $.first_child(fragment);
		var meta_1 = $.sibling(meta, 2);
		var meta_2 = $.sibling(meta_1, 2);
		var meta_3 = $.sibling(meta_2, 2);
		var meta_4 = $.sibling(meta_3, 2);
		var meta_5 = $.sibling(meta_4, 4);
		var meta_6 = $.sibling(meta_5, 2);
		var node = $.sibling(meta_6, 2);

		$.html(node, () => $.get(jsonldScript));

		$.template_effect(() => {
			$.set_attribute(meta, 'content', $.get(currentPost).description);
			$.set_attribute(meta_1, 'content', $.get(currentPost).title);
			$.set_attribute(meta_2, 'content', $.get(currentPost).description);
			$.set_attribute(meta_3, 'content', WebsiteName);
			$.set_attribute(meta_4, 'content', $.get(pageUrl));
			$.set_attribute(meta_5, 'content', $.get(currentPost).title);
			$.set_attribute(meta_6, 'content', $.get(currentPost).description);
		});

		$.deferred_template_effect(() => {
			$.document.title = $.get(currentPost).title ?? '';
		});

		$.append($$anchor, fragment);
	});

	var div = $.child(article);
	var text = $.only_child(div, true);
	var h1 = $.sibling(div, 2);
	var text_1 = $.only_child(h1, true);
	var node_1 = $.sibling(h1, 2);

	$.snippet(node_1, () => $$props.children ?? $.noop);
	$.reset(article);

	$.template_effect(
		($0) => {
			$.set_text(text, $0);
			$.set_text(text_1, $.get(currentPost).title);
		},
		[
			() => $.get(currentPost).parsedDate?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
		]
	);

	$.append($$anchor, article);
	$.pop();
	$$cleanup();
}