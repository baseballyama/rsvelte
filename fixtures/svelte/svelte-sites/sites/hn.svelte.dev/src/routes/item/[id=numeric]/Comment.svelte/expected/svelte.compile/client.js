import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SubsetHTML from '$lib/SubsetHTML.svelte';
import CommentElement from './Comment.svelte';
import { resolve } from '$app/paths';
import { timeAgo } from '$lib/utils';

var root = $.from_html(`<li class="svelte-bp2yyv"><!></li>`);
var root_1 = $.from_html(`<ul class="children svelte-bp2yyv"></ul>`);
var root_2 = $.from_html(`<article class="comment svelte-bp2yyv"><details open="" class="svelte-bp2yyv"><summary class="svelte-bp2yyv"><div class="meta-bar svelte-bp2yyv" role="button" tabindex="0"><span class="meta svelte-bp2yyv"><a class="svelte-bp2yyv"> </a> </span></div></summary> <div class="body svelte-bp2yyv"><!></div> <!></details></article>`);

export default function Comment($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var article = root_2();
			var details = $.child(article);
			var summary = $.child(details);
			var div = $.child(summary);
			var span = $.child(div);
			var a = $.child(span);
			var text = $.only_child(a, true);
			var text_1 = $.sibling(a);

			$.reset(span);
			$.reset(div);
			$.reset(summary);

			var div_1 = $.sibling(summary, 2);
			var node_1 = $.child(div_1);

			SubsetHTML(node_1, {
				get content() {
					return $$props.comment.text;
				}
			});

			$.reset(div_1);

			var node_2 = $.sibling(div_1, 2);

			{
				var consequent = ($$anchor) => {
					var ul = root_1();

					$.each(ul, 21, () => $$props.comment.children, (child) => child.id, ($$anchor, child) => {
						var li = root();
						var node_3 = $.child(li);

						CommentElement(node_3, {
							get comment() {
								return $.get(child);
							},

							get now() {
								return $$props.now;
							}
						});

						$.reset(li);
						$.append($$anchor, li);
					});

					$.reset(ul);
					$.append($$anchor, ul);
				};

				$.if(node_2, ($$render) => {
					if ($$props.comment.children && $$props.comment.children.length > 0) $$render(consequent);
				});
			}

			$.reset(details);
			$.reset(article);

			$.template_effect(
				($0, $1) => {
					$.set_attribute(article, 'id', `${$$props.comment.id}`);
					$.set_attribute(a, 'href', $0);
					$.set_text(text, $$props.comment.author);
					$.set_text(text_1, ` ${$1 ?? ''}`);
				},
				[
					() => resolve('/user/[name]', { name: $$props.comment.author }),
					() => timeAgo($$props.now - $$props.comment.created_at_i)
				]
			);

			$.append($$anchor, article);
		};

		$.if(node, ($$render) => {
			if (typeof $$props.comment !== null) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}