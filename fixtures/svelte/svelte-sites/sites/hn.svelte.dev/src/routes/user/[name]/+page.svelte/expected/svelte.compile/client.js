import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SubsetHTML from '$lib/SubsetHTML.svelte';
import { timeAgo } from '$lib/utils';

var root = $.from_html(`<div class="about"><!></div>`);
var root_1 = $.from_html(`<h1> </h1> <div><p>...joined <strong> </strong>, and has <strong> </strong> karma</p> <p><a rel="external">submissions</a> / <a rel="external">comments</a> / <a rel="external">favourites</a></p> <!></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const user = $.derived(() => $$props.data.user),
		now = $.derived(() => $$props.data.now);

	var fragment = root_1();

	$.head('1qch8zw', ($$anchor) => {
		$.deferred_template_effect(() => {
			$.document.title = `${$.get(user).id ?? ''} • Svelte Hacker News`;
		});
	});

	var h1 = $.first_child(fragment);
	var text = $.only_child(h1, true);
	var div = $.sibling(h1, 2);
	var p = $.child(div);
	var strong = $.sibling($.child(p));
	var text_1 = $.only_child(strong, true);
	var strong_1 = $.sibling(strong, 2);
	var text_2 = $.only_child(strong_1, true);

	$.next();
	$.reset(p);

	var p_1 = $.sibling(p, 2);
	var a = $.child(p_1);
	var a_1 = $.sibling(a, 2);
	var a_2 = $.sibling(a_1, 2);

	$.reset(p_1);

	var node = $.sibling(p_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_1 = root();
			var node_1 = $.child(div_1);

			SubsetHTML(node_1, {
				get content() {
					return $.get(user).about;
				}
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		};

		$.if(node, ($$render) => {
			if ($.get(user).about) $$render(consequent);
		});
	}

	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_text(text, $.get(user).id);
			$.set_text(text_1, $0);
			$.set_text(text_2, $.get(user).karma);
			$.set_attribute(a, 'href', `https://news.ycombinator.com/submitted?id=${$.get(user).id ?? ''}`);
			$.set_attribute(a_1, 'href', `https://news.ycombinator.com/threads?id=${$.get(user).id ?? ''}`);
			$.set_attribute(a_2, 'href', `https://news.ycombinator.com/favorites?id=${$.get(user).id ?? ''}`);
		},
		[() => timeAgo($.get(now) - $.get(user).created)]
	);

	$.append($$anchor, fragment);
	$.pop();
}