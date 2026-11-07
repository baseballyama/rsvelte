import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { page } from '$app/state';
import SeoHeader from '$lib/components/seo/seo-header.svelte';

var root = $.from_html(`<a><img class="h-48 w-full object-cover"/></a>`);
var root_1 = $.from_html(`<span> </span> <span>•</span>`, 1);
var root_2 = $.from_html(`<p class="mb-4 text-gray-600"> </p>`);
var root_3 = $.from_html(`<span class="rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-600"> </span>`);
var root_4 = $.from_html(`<div class="flex gap-2"></div>`);
var root_5 = $.from_html(`<article class="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"><!> <div class="p-6"><div class="mb-3 flex items-center gap-2 text-sm text-gray-600"><!> <time> </time></div> <h2 class="mb-2 text-xl font-semibold text-gray-900"><a class="transition-colors hover:text-blue-600"> </a></h2> <!> <!></div></article>`);
var root_6 = $.from_html(`<div class="grid gap-8 md:grid-cols-2"></div>`);
var root_7 = $.from_html(`<div class="py-8 text-center text-gray-500"><p>No blog posts available at the moment.</p></div>`);
var root_8 = $.from_html(`<!> <div class="mx-auto max-w-4xl px-4 py-8"><h1 class="mb-8 text-center text-4xl font-bold text-gray-900">Blog</h1> <!></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const posts = $.derived(() => page.data.blogs);

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	}

	var fragment = root_8();
	var node = $.first_child(fragment);

	SeoHeader(node, { metaTitle: 'Blog | Insights & News' });

	var div = $.sibling(node, 2);
	var node_1 = $.sibling($.child(div), 2);

	{
		var consequent_4 = ($$anchor) => {
			var div_1 = root_6();

			$.each(div_1, 21, () => $.get(posts).data, (post) => post.id, ($$anchor, post) => {
				var article = root_5();
				var node_2 = $.child(article);

				{
					var consequent = ($$anchor) => {
						var a = root();
						var img = $.only_child(a);

						$.template_effect(() => {
							$.set_attribute(a, 'href', `/blog/${$.get(post).slug || $.get(post).id}`);
							$.set_attribute(img, 'src', $.get(post).imageUrl || $.get(post).thumbnail);
							$.set_attribute(img, 'alt', $.get(post).title);
						});

						$.append($$anchor, a);
					};

					$.if(node_2, ($$render) => {
						if ($.get(post).imageUrl || $.get(post).thumbnail) $$render(consequent);
					});
				}

				var div_2 = $.sibling(node_2, 2);
				var div_3 = $.child(div_2);
				var node_3 = $.child(div_3);

				{
					var consequent_1 = ($$anchor) => {
						var fragment_1 = root_1();
						var span = $.first_child(fragment_1);
						var text = $.only_child(span, true);

						$.next(2);
						$.template_effect(() => $.set_text(text, $.get(post).author));
						$.append($$anchor, fragment_1);
					};

					$.if(node_3, ($$render) => {
						if ($.get(post).author) $$render(consequent_1);
					});
				}

				var time = $.sibling(node_3, 2);
				var text_1 = $.only_child(time, true);

				$.reset(div_3);

				var h2 = $.sibling(div_3, 2);
				var a_1 = $.child(h2);
				var text_2 = $.only_child(a_1, true);

				$.reset(h2);

				var node_4 = $.sibling(h2, 2);

				{
					var consequent_2 = ($$anchor) => {
						var p = root_2();
						var text_3 = $.only_child(p, true);

						$.template_effect(() => $.set_text(text_3, $.get(post).excerpt));
						$.append($$anchor, p);
					};

					$.if(node_4, ($$render) => {
						if ($.get(post).excerpt) $$render(consequent_2);
					});
				}

				var node_5 = $.sibling(node_4, 2);

				{
					var consequent_3 = ($$anchor) => {
						var div_4 = root_4();

						$.each(div_4, 21, () => $.get(post).tags, $.index, ($$anchor, tag) => {
							var span_1 = root_3();
							var text_4 = $.only_child(span_1, true);

							$.template_effect(() => $.set_text(text_4, $.get(tag)));
							$.append($$anchor, span_1);
						});

						$.reset(div_4);
						$.append($$anchor, div_4);
					};

					$.if(node_5, ($$render) => {
						if ($.get(post).tags?.length) $$render(consequent_3);
					});
				}

				$.reset(div_2);
				$.reset(article);

				$.template_effect(
					($0) => {
						$.set_attribute(time, 'datetime', $.get(post).createdAt);
						$.set_text(text_1, $0);
						$.set_attribute(a_1, 'href', `/blog/${$.get(post).slug || $.get(post).id}`);
						$.set_text(text_2, $.get(post).title);
					},
					[() => formatDate($.get(post).createdAt)]
				);

				$.append($$anchor, article);
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		var alternate = ($$anchor) => {
			var div_5 = root_7();

			$.append($$anchor, div_5);
		};

		$.if(node_1, ($$render) => {
			if ($.get(posts)?.data?.length) $$render(consequent_4); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.append($$anchor, fragment);
	$.pop();
}