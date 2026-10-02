import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { flip } from 'svelte/animate';
import { crossfade } from 'svelte/transition';

var root = $.from_html(`<article><h3> </h3> <p class="svelte-i6picb"> </p> <div><button class="svelte-i6picb">✏️</button> <button class="svelte-i6picb">💾</button> <button class="svelte-i6picb">❌</button></div></article>`);
var root_1 = $.from_html(`<p class="svelte-i6picb">There are no posts.</p>`);
var root_2 = $.from_html(`<article class="svelte-i6picb"><h3> </h3> <div><button class="svelte-i6picb">♻️</button></div></article>`);
var root_3 = $.from_html(`<p class="svelte-i6picb">Archived items go here.</p>`);
var root_4 = $.from_html(`<div class="container svelte-i6picb"><div><div class="posts svelte-i6picb"><div><section class="svelte-i6picb"></section></div> <div class="archive svelte-i6picb"><section class="svelte-i6picb"></section></div></div></div></div>`);

export default function Crossfade_flip($$anchor, $$props) {
	$.push($$props, true);

	const [send, receive] = crossfade({});

	let posts = $.proxy([
		{
			id: 1,
			title: 'Post A',
			description: 'Content',
			published: true
		},

		{
			id: 2,
			title: 'Post B',
			description: 'Content',
			published: true
		},

		{
			id: 3,
			title: 'Post C',
			description: 'Content',
			published: true
		},

		{
			id: 4,
			title: 'Post D',
			description: 'Content',
			published: true
		}
	]);

	function togglePublished(post) {
		const index = posts.findIndex((p) => p.id === post.id);

		posts[index].published = !posts[index].published;
	}

	function removePost(post) {
		const index = posts.findIndex((p) => p.id === post.id);

		posts.splice(index, 1);
	}

	var div = root_4();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var div_3 = $.child(div_2);
	var section = $.child(div_3);

	$.each(
		section,
		28,
		() => posts.filter((posts) => posts.published),
		(post) => post,
		($$anchor, post) => {
			var article = root();
			var h3 = $.child(article);
			var text = $.only_child(h3, true);
			var p_1 = $.sibling(h3, 2);
			var text_1 = $.only_child(p_1, true);
			var div_4 = $.sibling(p_1, 2);
			var button = $.sibling($.child(div_4), 2);
			var button_1 = $.sibling(button, 2);

			$.reset(div_4);
			$.reset(article);

			$.template_effect(() => {
				$.set_text(text, post.title);
				$.set_text(text_1, post.description);
			});

			$.delegated('click', button, () => togglePublished(post));
			$.delegated('click', button_1, () => removePost(post));
			$.animation(article, () => flip, () => ({ duration: 200 }));
			$.transition(1, article, () => receive, () => ({ key: post }));
			$.transition(2, article, () => send, () => ({ key: post }));
			$.append($$anchor, article);
		},
		($$anchor) => {
			var p_2 = root_1();

			$.append($$anchor, p_2);
		}
	);

	$.reset(section);
	$.reset(div_3);

	var div_5 = $.sibling(div_3, 2);
	var section_1 = $.child(div_5);

	$.each(
		section_1,
		28,
		() => posts.filter((posts) => !posts.published),
		(post) => post,
		($$anchor, post) => {
			var article_1 = root_2();
			var h3_1 = $.child(article_1);
			var text_2 = $.only_child(h3_1, true);
			var div_6 = $.sibling(h3_1, 2);
			var button_2 = $.only_child(div_6);

			$.reset(article_1);
			$.template_effect(() => $.set_text(text_2, post.title));
			$.delegated('click', button_2, () => togglePublished(post));
			$.animation(article_1, () => flip, () => ({ duration: 200 }));
			$.transition(1, article_1, () => receive, () => ({ key: post }));
			$.transition(2, article_1, () => send, () => ({ key: post }));
			$.append($$anchor, article_1);
		},
		($$anchor) => {
			var p_3 = root_3();

			$.append($$anchor, p_3);
		}
	);

	$.reset(section_1);
	$.reset(div_5);
	$.reset(div_2);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);