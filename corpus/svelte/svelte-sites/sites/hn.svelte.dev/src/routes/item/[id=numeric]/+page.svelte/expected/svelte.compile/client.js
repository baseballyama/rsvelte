import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import SubsetHTML from '$lib/SubsetHTML.svelte';
import { timeAgo } from '$lib/utils';
import CommentElement from './Comment.svelte';

var root = $.from_html(`<small class="svelte-1d2597w"> </small>`);
var root_1 = $.from_html(`<!> <small class="svelte-1d2597w"> </small>`, 1);
var root_2 = $.from_html(`<div class="comments svelte-1d2597w"></div>`);
var root_3 = $.from_html(`<div><article class="item svelte-1d2597w"><a class="main-link svelte-1d2597w" rel="external"><h1 class="svelte-1d2597w"> </h1> <!></a> <p class="meta svelte-1d2597w"> <a> </a> </p> <!> <!></article> <!></div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const algoliaItem = $.derived(() => $$props.data.algoliaItem),
		pollOptions = $.derived(() => $$props.data.pollOptions),
		now = $.derived(() => $$props.data.now);

	var div = root_3();

	$.head('1d2597w', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = `${$.get(algoliaItem).title ?? ''} | Svelte Hacker News`;
		});
	});

	var article = $.child(div);
	var a = $.child(article);
	var h1 = $.child(a);
	var text = $.only_child(h1, true);
	var node = $.sibling(h1, 2);

	{
		var consequent = ($$anchor) => {
			var small = root();
			var text_1 = $.only_child(small, true);

			$.template_effect(() => $.set_text(text_1, new URL($.get(algoliaItem).url).hostname));
			$.append($$anchor, small);
		};

		$.if(node, ($$render) => {
			if ($.get(algoliaItem).url) $$render(consequent);
		});
	}

	$.reset(a);

	var p = $.sibling(a, 2);
	var text_2 = $.child(p);
	var a_1 = $.sibling(text_2);
	var text_3 = $.only_child(a_1, true);
	var text_4 = $.sibling(a_1);

	$.reset(p);

	var node_1 = $.sibling(p, 2);

	{
		var consequent_1 = ($$anchor) => {
			SubsetHTML($$anchor, {
				get content() {
					return $.get(algoliaItem).text;
				}
			});
		};

		$.if(node_1, ($$render) => {
			if ($.get(algoliaItem).text) $$render(consequent_1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_3 = $.first_child(fragment_1);

			$.each(node_3, 17, () => $.get(pollOptions), (pollOption) => pollOption.id, ($$anchor, pollOption) => {
				var fragment_2 = root_1();
				var node_4 = $.first_child(fragment_2);

				SubsetHTML(node_4, {
					get content() {
						return $.get(pollOption).text;
					}
				});

				var small_1 = $.sibling(node_4, 2);
				var text_5 = $.only_child(small_1);

				$.template_effect(() => $.set_text(text_5, `${$.get(pollOption).score ?? ''} points`));
				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_2, ($$render) => {
			if ($.get(algoliaItem).options && $.get(algoliaItem).options.length > 0) $$render(consequent_2);
		});
	}

	$.reset(article);

	var node_5 = $.sibling(article, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_1 = root_2();

			$.each(div_1, 21, () => $.get(algoliaItem).children, (comment) => comment.id, ($$anchor, comment) => {
				CommentElement($$anchor, {
					get comment() {
						return $.get(comment);
					},

					get now() {
						return $.get(now);
					}
				});
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node_5, ($$render) => {
			if ($.get(algoliaItem).children && $.get(algoliaItem).children.length > 0) $$render(consequent_3);
		});
	}

	$.reset(div);

	$.template_effect(
		($0, $1) => {
			$.set_attribute(a, 'href', $.get(algoliaItem).url);
			$.set_text(text, $.get(algoliaItem).title);

			$.set_text(text_2, `${$.get(algoliaItem).points ?? ''}
			${$.get(algoliaItem).points === 1 ? 'point' : 'points'} by `);

			$.set_attribute(a_1, 'href', $0);
			$.set_text(text_3, $.get(algoliaItem).author);
			$.set_text(text_4, ` ${$1 ?? ''}`);
		},
		[
			() => resolve('/user/[name]', { name: $.get(algoliaItem).author }),
			() => timeAgo($.get(now) - $.get(algoliaItem).created_at_i)
		]
	);

	$.append($$anchor, div);
	$.pop();
}