import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { sortedBlogPosts, blogInfo } from "./posts";

var root = $.from_html(`<meta name="description" content="Our blog posts."/>`);
var root_1 = $.from_html(`<a><div class="card my-6 bg-white shadow-xl flex-row overflow-hidden"><div class="flex-none w-6 md:w-32 bg-secondary"></div> <div class="py-6 px-6"><div class="text-xl"> </div> <div class="text-sm text-accent"> </div> <div class="text-slate-500"> </div></div></div></a>`);
var root_2 = $.from_html(`<div class="py-8 lg:py-12 px-6 max-w-lg mx-auto"><div class="text-3xl lg:text-5xl font-medium text-primary flex gap-3 items-baseline text-center place-content-center"><div class="text-center leading-relaxed font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-accent"> </div> <a href="/blog/rss.xml" target="_blank" rel="noreferrer"><img class="flex-none w-5 h-5 object-contain" src="/images/rss.svg" alt="rss feed"/></a></div> <div class="text-lg text-center">A demo blog with sample content.</div> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var div = root_2();

	$.head('8fdu19', ($$anchor) => {
		var meta = root();

		$.deferred_template_effect(() => {
			$.document.title = blogInfo.name ?? '';
		});

		$.append($$anchor, meta);
	});

	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var text = $.only_child(div_2, true);

	$.next(2);
	$.reset(div_1);

	var node = $.sibling(div_1, 4);

	$.each(node, 17, () => sortedBlogPosts, $.index, ($$anchor, post) => {
		var a = root_1();
		var div_3 = $.child(a);
		var div_4 = $.sibling($.child(div_3), 2);
		var div_5 = $.child(div_4);
		var text_1 = $.only_child(div_5, true);
		var div_6 = $.sibling(div_5, 2);
		var text_2 = $.only_child(div_6, true);
		var div_7 = $.sibling(div_6, 2);
		var text_3 = $.only_child(div_7, true);

		$.reset(div_4);
		$.reset(div_3);
		$.reset(a);

		$.template_effect(
			($0) => {
				$.set_attribute(a, 'href', $.get(post).link);
				$.set_text(text_1, $.get(post).title);
				$.set_text(text_2, $0);
				$.set_text(text_3, $.get(post).description);
			},
			[
				() => $.get(post).parsedDate?.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
			]
		);

		$.append($$anchor, a);
	});

	$.reset(div);
	$.template_effect(() => $.set_text(text, blogInfo.name));
	$.append($$anchor, div);
	$.pop();
}