import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { base } from '$app/paths';
import { onMount } from 'svelte';
import { blogConfig } from 'virtual:sveltepress/blog-config';
import GiscusComments from './GiscusComments.svelte';
import PostHero from './PostHero.svelte';
import PostMeta from './PostMeta.svelte';
import PostNav from './PostNav.svelte';
import ReadingProgress from './ReadingProgress.svelte';
import RelatedPosts from './RelatedPosts.svelte';
import TableOfContents from './TableOfContents.svelte';

var root = $.from_html(`<meta property="article:author"/>`);
var root_1 = $.from_html(`<meta property="article:tag"/>`);
var root_2 = $.from_html(`<meta property="og:type" content="article"/> <meta property="og:title"/> <meta name="description"/> <meta property="og:description"/> <meta property="og:image"/> <meta property="article:published_time"/> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<!> <article class="sp-post"><!> <div class="sp-post__body svelte-1str98b"><div class="sp-post__content-wrap svelte-1str98b"><!> <div class="sp-post-content svelte-1str98b"></div> <!> <!> <!></div> <aside class="sp-post__toc svelte-1str98b"><!></aside></div></article>`, 1);

export default function PostLayout($$anchor, $$props) {
	$.push($$props, true);

	const siteTitle = blogConfig.title ?? 'Blog';
	const ogOrigin = blogConfig.base?.replace(/\/$/, '') ?? base;
	const ogImage = $.derived(() => `${ogOrigin}/og/${$$props.post.slug}.png`);

	const jsonLd = $.derived(() => {
		const authorName = $$props.post.author ?? blogConfig.author?.name;
		const data = {};

		data['@context'] = 'https://schema.org';
		data['@type'] = 'BlogPosting';
		data.headline = $$props.post.title;
		data.datePublished = $$props.post.date;
		data.image = $.get(ogImage);
		data.description = $$props.post.excerpt;
		data.keywords = $$props.post.tags.join(', ');

		if (authorName) {
			const a = {};

			a['@type'] = 'Person';
			a.name = authorName;
			data.author = a;
		}

		return JSON.stringify(data);
	});

	onMount(() => {
		const container = document.querySelector('.sp-post-content');

		if (!container) return;

		const handler = (e) => {
			const btn = e.target.closest('.svp-code-block--copy-btn');

			if (!btn) return;

			const code = btn.closest('.svp-code-block')?.querySelector('.shiki')?.textContent || '';

			navigator.clipboard.writeText(code);
			btn.classList.add('copied');
			setTimeout(() => btn.classList.remove('copied'), 2000);
		};

		container.addEventListener('click', handler);

		return () => container.removeEventListener('click', handler);
	});

	var fragment_1 = root_3();

	$.head('1str98b', ($$anchor) => {
		var fragment = root_2();
		var meta = $.sibling($.first_child(fragment), 2);
		var meta_1 = $.sibling(meta, 2);
		var meta_2 = $.sibling(meta_1, 2);
		var meta_3 = $.sibling(meta_2, 2);
		var meta_4 = $.sibling(meta_3, 2);
		var node = $.sibling(meta_4, 2);

		{
			var consequent = ($$anchor) => {
				var meta_5 = root();

				$.template_effect(() => $.set_attribute(meta_5, 'content', $$props.post.author));
				$.append($$anchor, meta_5);
			};

			$.if(node, ($$render) => {
				if ($$props.post.author) $$render(consequent);
			});
		}

		var node_1 = $.sibling(node, 2);

		$.each(node_1, 16, () => $$props.post.tags, (t) => t, ($$anchor, t) => {
			var meta_6 = root_1();

			$.template_effect(() => $.set_attribute(meta_6, 'content', t));
			$.append($$anchor, meta_6);
		});

		var node_2 = $.sibling(node_1, 2);

		$.html(node_2, () => `<${'script'} type="application/ld+json">${$.get(jsonLd)}</${'script'}>`);

		$.template_effect(() => {
			$.set_attribute(meta, 'content', $$props.post.title);
			$.set_attribute(meta_1, 'content', $$props.post.excerpt);
			$.set_attribute(meta_2, 'content', $$props.post.excerpt);
			$.set_attribute(meta_3, 'content', $.get(ogImage));
			$.set_attribute(meta_4, 'content', $$props.post.date);
		});

		$.deferred_template_effect(() => {
			$.document.title = `${$$props.post.title ?? ''} | ${siteTitle ?? ''}`;
		});

		$.append($$anchor, fragment);
	});

	var node_3 = $.first_child(fragment_1);

	ReadingProgress(node_3, { target: '.sp-post' });

	var article = $.sibling(node_3, 2);
	var node_4 = $.child(article);

	PostHero(node_4, {
		get post() {
			return $$props.post;
		}
	});

	var div = $.sibling(node_4, 2);
	var div_1 = $.child(div);
	var node_5 = $.child(div_1);

	PostMeta(node_5, {
		get post() {
			return $$props.post;
		}
	});

	var div_2 = $.sibling(node_5, 2);

	$.html(div_2, () => $$props.post.contentHtml, true);
	$.reset(div_2);

	var node_6 = $.sibling(div_2, 2);

	PostNav(node_6, {
		get prev() {
			return $$props.prev;
		},

		get next() {
			return $$props.next;
		}
	});

	var node_7 = $.sibling(node_6, 2);

	{
		var consequent_1 = ($$anchor) => {
			RelatedPosts($$anchor, {
				get posts() {
					return $$props.post.related;
				}
			});
		};

		$.if(node_7, ($$render) => {
			if ($$props.post.related?.length) $$render(consequent_1);
		});
	}

	var node_8 = $.sibling(node_7, 2);

	GiscusComments(node_8, {});
	$.reset(div_1);

	var aside = $.sibling(div_1, 2);
	var node_9 = $.child(aside);

	TableOfContents(node_9, {
		get category() {
			return $$props.post.category;
		}
	});

	$.reset(aside);
	$.reset(div);
	$.reset(article);
	$.append($$anchor, fragment_1);
	$.pop();
}