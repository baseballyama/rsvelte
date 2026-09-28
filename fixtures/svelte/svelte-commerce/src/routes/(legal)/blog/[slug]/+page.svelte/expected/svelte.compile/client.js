import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import SeoHeader from '$lib/components/seo/seo-header.svelte';
import StructuredData from '$lib/components/seo/structured-data.svelte';

var root = $.from_html(`<img class="mb-8 h-64 w-full rounded-lg object-cover"/>`);
var root_1 = $.from_html(`<div class="flex items-center gap-2"><span class="font-medium"> </span></div> <span>•</span>`, 1);
var root_2 = $.from_html(`<time> </time>`);
var root_3 = $.from_html(`<span class="mr-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"> </span>`);
var root_4 = $.from_html(`<div class="mb-8"></div>`);
var root_5 = $.from_html(`<article class="prose prose-lg max-w-none"><!> <header class="mb-8"><h1 class="mb-4 text-4xl font-bold text-gray-900"> </h1> <div class="flex items-center gap-4 text-gray-600"><!> <!></div></header> <!> <div class="prose prose-lg prose-gray prose-p:my-0 prose-li:my-0"></div></article> <div class="mt-12 border-t pt-8"><a href="/blog" class="inline-flex items-center text-blue-600 transition-colors hover:text-blue-800">← Back to Blog</a></div>`, 1);
var root_6 = $.from_html(`<div class="py-8 text-center text-gray-500"><p>Blog post not found.</p> <a href="/blog" class="mt-4 inline-block text-blue-600 transition-colors hover:text-blue-800">← Back to Blog</a></div>`);
var root_7 = $.from_html(`<!> <!> <div class="mx-auto max-w-4xl px-4 py-8"><!></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const blog = $.derived(() => page.data.blog);
	const store = $.derived(() => page.data.store);

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	}

	// Meta description: prefer explicit meta/excerpt if the API provides them,
	// otherwise strip HTML from the post content and trim to a sane length.
	const metaDescription = $.derived(() => ($.get(blog)?.metaDescription || $.get(blog)?.excerpt || ($.get(blog)?.content ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()).slice(0, 160).trim());

	const blogImage = $.derived(() => $.get(blog)?.banner || $.get(blog)?.imageUrl || $.get(blog)?.thumbnail || '');

	// BlogPosting/Article structured data — only include fields that actually exist, and mirror
	// what the page visibly renders (byline author, published-at date) so the markup cannot
	// disagree with the content.
	const publishedAt = $.derived(() => $.get(blog)?.publishedAt || $.get(blog)?.createdAt);

	const articleJsonLd = $.derived(() => ({
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: $.get(blog)?.title,
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': page.url.origin + page.url.pathname
		},
		...$.get(metaDescription) ? { description: $.get(metaDescription) } : {},
		...$.get(blogImage) ? { image: [$.get(blogImage)] } : {},
		...$.get(publishedAt) ? { datePublished: $.get(publishedAt) } : {},
		...$.get(blog)?.updatedAt ? { dateModified: $.get(blog).updatedAt } : {},
		author: $.get(blog)?.author
			? { '@type': 'Person', name: $.get(blog).author }
			: { '@type': 'Organization', name: $.get(store)?.name },

		publisher: {
			'@type': 'Organization',
			name: $.get(store)?.name,
			...$.get(store)?.logo
				? { logo: { '@type': 'ImageObject', url: $.get(store).logo } }
				: {}
		}
	}));

	var fragment = root_7();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => $.get(blog)?.metaTitle || $.get(blog)?.title || 'Blog');

		SeoHeader(node, {
			get metaTitle() {
				return $.get($0);
			},

			get metaDescription() {
				return $.get(metaDescription);
			},

			get image() {
				return $.get(blogImage);
			}
		});
	}

	var node_1 = $.sibling(node, 2);

	StructuredData(node_1, {
		get schema() {
			return $.get(articleJsonLd);
		}
	});

	var div = $.sibling(node_1, 2);
	var node_2 = $.child(div);

	{
		var consequent_4 = ($$anchor) => {
			var fragment_1 = root_5();
			var article = $.first_child(fragment_1);
			var node_3 = $.child(article);

			{
				var consequent = ($$anchor) => {
					var img = root();

					$.template_effect(() => {
						$.set_attribute(img, 'src', $.get(blogImage));
						$.set_attribute(img, 'alt', $.get(blog).title);
					});

					$.append($$anchor, img);
				};

				$.if(node_3, ($$render) => {
					if ($.get(blogImage)) $$render(consequent);
				});
			}

			var header = $.sibling(node_3, 2);
			var h1 = $.child(header);
			var text = $.only_child(h1, true);
			var div_1 = $.sibling(h1, 2);
			var node_4 = $.child(div_1);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_2 = root_1();
					var div_2 = $.first_child(fragment_2);
					var span = $.child(div_2);
					var text_1 = $.only_child(span, true);

					$.reset(div_2);
					$.next(2);
					$.template_effect(() => $.set_text(text_1, $.get(blog).author));
					$.append($$anchor, fragment_2);
				};

				$.if(node_4, ($$render) => {
					if ($.get(blog).author) $$render(consequent_1);
				});
			}

			var node_5 = $.sibling(node_4, 2);

			{
				var consequent_2 = ($$anchor) => {
					var time = root_2();
					var text_2 = $.only_child(time, true);

					$.template_effect(
						($0) => {
							$.set_attribute(time, 'datetime', $.get(blog).publishedAt || $.get(blog).createdAt);
							$.set_text(text_2, $0);
						},
						[
							() => formatDate($.get(blog).publishedAt || $.get(blog).createdAt)
						]
					);

					$.append($$anchor, time);
				};

				$.if(node_5, ($$render) => {
					if ($.get(blog).publishedAt || $.get(blog).createdAt) $$render(consequent_2);
				});
			}

			$.reset(div_1);
			$.reset(header);

			var node_6 = $.sibling(header, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_3 = root_4();

					$.each(div_3, 21, () => $.get(blog).tags, $.index, ($$anchor, tag) => {
						var span_1 = root_3();
						var text_3 = $.only_child(span_1, true);

						$.template_effect(() => $.set_text(text_3, $.get(tag)));
						$.append($$anchor, span_1);
					});

					$.reset(div_3);
					$.append($$anchor, div_3);
				};

				$.if(node_6, ($$render) => {
					if ($.get(blog).tags?.length) $$render(consequent_3);
				});
			}

			var div_4 = $.sibling(node_6, 2);

			$.html(div_4, () => $.get(blog).content, true);
			$.reset(div_4);
			$.reset(article);
			$.next(2);
			$.template_effect(() => $.set_text(text, $.get(blog).title));
			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var div_5 = root_6();

			$.append($$anchor, div_5);
		};

		$.if(node_2, ($$render) => {
			if ($.get(blog)) $$render(consequent_4); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}