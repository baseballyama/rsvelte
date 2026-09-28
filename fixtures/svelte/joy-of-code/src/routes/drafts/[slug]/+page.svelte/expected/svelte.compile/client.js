import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { formatDate } from '$lib/utils';
import * as config from '$lib/site/config';
import Card from '../../[slug]/card.svelte';
import Clipboard from '../../[slug]/clipboard.svelte';
import TableOfContents from '../../[slug]/toc.svelte';

var root = $.from_html(`<meta name="description"/> <meta property="og:title"/> <meta property="og:image"/> <meta property="og:url"/> <meta property="og:description"/> <meta property="og:site_name"/> <meta name="twitter:creator"/> <meta content="summary_large_image" name="twitter:card"/> <meta name="twitter:title"/> <meta name="twitter:description"/> <meta name="twitter:image"/>`, 1);
var root_1 = $.from_html(`<!> <main><!> <article class="prose"><header><h1 class="title svelte-1qeaqd3"> </h1> <p class="published svelte-1qeaqd3"> </p></header> <!></article> <div class="cards svelte-1qeaqd3"><!> <!></div></main>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let editUrl = $.derived(() => `${config.fileUrl}/${$$props.data.frontmatter.slug}/${$$props.data.frontmatter.slug}.md`);
	let image = $.derived(() => `${config.postImage}${encodeURIComponent($$props.data.frontmatter.title)}.png`);
	var fragment_1 = root_1();

	$.head('1qeaqd3', ($$anchor) => {
		var fragment = root();
		var meta = $.first_child(fragment);
		var meta_1 = $.sibling(meta, 2);
		var meta_2 = $.sibling(meta_1, 2);
		var meta_3 = $.sibling(meta_2, 2);
		var meta_4 = $.sibling(meta_3, 2);
		var meta_5 = $.sibling(meta_4, 2);
		var meta_6 = $.sibling(meta_5, 2);
		var meta_7 = $.sibling(meta_6, 4);
		var meta_8 = $.sibling(meta_7, 2);
		var meta_9 = $.sibling(meta_8, 2);

		$.template_effect(() => {
			$.set_attribute(meta, 'content', $$props.data.frontmatter.description);
			$.set_attribute(meta_1, 'content', $$props.data.frontmatter.title);
			$.set_attribute(meta_2, 'content', $.get(image));
			$.set_attribute(meta_3, 'content', config.siteUrl);
			$.set_attribute(meta_4, 'content', $$props.data.frontmatter.description);
			$.set_attribute(meta_5, 'content', config.siteName);
			$.set_attribute(meta_6, 'content', config.twitterHandle);
			$.set_attribute(meta_7, 'content', $$props.data.frontmatter.title);
			$.set_attribute(meta_8, 'content', $$props.data.frontmatter.description);
			$.set_attribute(meta_9, 'content', $.get(image));
		});

		$.deferred_template_effect(() => {
			$.document.title = $$props.data.frontmatter.title ?? '';
		});

		$.append($$anchor, fragment);
	});

	var node = $.first_child(fragment_1);

	Clipboard(node, {});

	var main = $.sibling(node, 2);
	var node_1 = $.child(main);

	TableOfContents(node_1, {});

	var article = $.sibling(node_1, 2);
	var header = $.child(article);
	var h1 = $.child(header);
	var text = $.only_child(h1, true);
	var p = $.sibling(h1, 2);
	var text_1 = $.only_child(p);

	$.reset(header);

	var node_2 = $.sibling(header, 2);

	$.component(node_2, () => $$props.data.component, ($$anchor, data_component) => {
		data_component($$anchor, {});
	});

	$.reset(article);

	var div = $.sibling(article, 2);
	var node_3 = $.child(div);

	Card(node_3, { preset: 'support' });

	var node_4 = $.sibling(node_3, 2);

	Card(node_4, {
		preset: 'edit',
		get editUrl() {
			return $.get(editUrl);
		}
	});

	$.reset(div);
	$.reset(main);

	$.template_effect(
		($0) => {
			$.set_text(text, $$props.data.frontmatter.title);
			$.set_text(text_1, `Published ${$0 ?? ''}`);
		},
		[() => formatDate($$props.data.frontmatter.published)]
	);

	$.append($$anchor, fragment_1);
	$.pop();
}