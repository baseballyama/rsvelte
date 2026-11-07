import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { resolve } from '$app/paths';
import { timeAgo } from '$lib/utils';

var root = $.from_html(`<a rel="external" class="svelte-qvpc2r"> <small class="svelte-qvpc2r"> </small></a>`);
var root_1 = $.from_html(`<a class="svelte-qvpc2r"> </a>`);
var root_2 = $.from_html(`| <a> </a>`, 1);
var root_3 = $.from_html(`<article class="svelte-qvpc2r"><h2 class="svelte-qvpc2r"><!></h2> <p class="svelte-qvpc2r"> <a> </a> <!></p> <span class="index svelte-qvpc2r"> </span></article>`);

export default function ItemSummary($$anchor, $$props) {
	$.push($$props, true);

	var article = root_3();
	var h2 = $.child(article);
	var node = $.child(h2);

	{
		var consequent = ($$anchor) => {
			var a = root();
			var text = $.child(a);
			var small = $.sibling(text);
			var text_1 = $.only_child(small, true);

			$.reset(a);

			$.template_effect(() => {
				$.set_attribute(a, 'href', $$props.item.url);
				$.set_text(text, `${$$props.item.title ?? ''} `);
				$.set_text(text_1, new URL($$props.item.url).hostname);
			});

			$.append($$anchor, a);
		};

		var alternate = ($$anchor) => {
			var a_1 = root_1();
			var text_2 = $.only_child(a_1, true);

			$.template_effect(
				($0) => {
					$.set_attribute(a_1, 'href', $0);
					$.set_text(text_2, $$props.item.title);
				},
				[
					() => resolve('/item/[id=numeric]', { id: `${$$props.item.id}` })
				]
			);

			$.append($$anchor, a_1);
		};

		$.if(node, ($$render) => {
			if ($$props.item.type !== 'poll' && $$props.item.url) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(h2);

	var p = $.sibling(h2, 2);
	var text_3 = $.child(p);
	var a_2 = $.sibling(text_3);
	var text_4 = $.only_child(a_2, true);
	var text_5 = $.sibling(a_2);
	var node_1 = $.sibling(text_5);

	{
		var consequent_1 = ($$anchor) => {
			var fragment = root_2();
			var a_3 = $.sibling($.first_child(fragment));
			var text_6 = $.only_child(a_3);

			$.template_effect(
				($0) => {
					$.set_attribute(a_3, 'href', $0);

					$.set_text(text_6, `${$$props.item.descendants ?? ''}
				${$$props.item.descendants === 1 ? 'comment' : 'comments'}`);
				},
				[
					() => resolve('/item/[id=numeric]', { id: `${$$props.item.id}` })
				]
			);

			$.append($$anchor, fragment);
		};

		$.if(node_1, ($$render) => {
			if ($$props.item.type !== 'job') $$render(consequent_1);
		});
	}

	$.reset(p);

	var span = $.sibling(p, 2);
	var text_7 = $.only_child(span, true);

	$.reset(article);

	$.template_effect(
		($0, $1) => {
			$.set_text(text_3, `${$$props.item.score ?? ''}
		${$$props.item.score === 1 ? 'point' : 'points'} by `);

			$.set_attribute(a_2, 'href', $0);
			$.set_text(text_4, $$props.item.by);
			$.set_text(text_5, ` ${$1 ?? ''} `);
			$.set_text(text_7, $$props.index);
		},
		[
			() => resolve('/user/[name]', { name: $$props.item.by }),
			() => timeAgo($$props.now - $$props.item.time)
		]
	);

	$.append($$anchor, article);
	$.pop();
}