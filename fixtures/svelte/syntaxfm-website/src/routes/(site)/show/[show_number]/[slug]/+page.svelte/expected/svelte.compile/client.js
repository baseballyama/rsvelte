import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import get_show_path from '$/utilities/slug.js';
import SwaggyNewsletterForm from '$lib/newsletter/SwaggyNewsletterForm.svelte';

var root = $.from_html(`<a class="prev-link"><p class="a svelte-wwy4r7"> </p> <p class="text-sm svelte-wwy4r7"> </p></a>`);
var root_1 = $.from_html(`<a class="next-link"><p class="a svelte-wwy4r7"> </p> <p class="text-sm svelte-wwy4r7"> </p></a>`);
var root_2 = $.from_html(`<a><img class="thumbnail svelte-wwy4r7"/></a>`);
var root_3 = $.from_html(`<div class="related-videos svelte-wwy4r7"><h2 class="h5">Related Videos</h2> <!></div>`);
var root_4 = $.from_html(`<div class="main"><div class="show-notes"></div> <nav class="prev-next svelte-wwy4r7"><div class="prev svelte-wwy4r7"><!></div> <div class="next svelte-wwy4r7"><!></div></nav></div> <div class="sidebar"><!> <div class="sticky zone"><!></div></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let show = $.derived(() => $$props.data.show),
		prev_show = $.derived(() => $$props.data.prev_show),
		next_show = $.derived(() => $$props.data.next_show);

	var fragment = root_4();
	var div = $.first_child(fragment);
	var div_1 = $.child(div);

	$.html(div_1, () => $.get(show).show_notes, true);
	$.reset(div_1);

	var nav = $.sibling(div_1, 2);
	var div_2 = $.child(nav);
	var node = $.child(div_2);

	{
		var consequent = ($$anchor) => {
			var a = root();
			var p = $.child(a);
			var text = $.only_child(p);
			var p_1 = $.sibling(p, 2);
			var text_1 = $.only_child(p_1, true);

			$.reset(a);

			$.template_effect(
				($0) => {
					$.set_attribute(a, 'href', $0);
					$.set_text(text, `← Prev #${$.get(prev_show).number ?? ''}`);
					$.set_text(text_1, $.get(prev_show).title);
				},
				[() => get_show_path($.get(prev_show))]
			);

			$.append($$anchor, a);
		};

		$.if(node, ($$render) => {
			if ($.get(prev_show)) $$render(consequent);
		});
	}

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_1 = $.child(div_3);

	{
		var consequent_1 = ($$anchor) => {
			var a_1 = root_1();
			var p_2 = $.child(a_1);
			var text_2 = $.only_child(p_2);
			var p_3 = $.sibling(p_2, 2);
			var text_3 = $.only_child(p_3, true);

			$.reset(a_1);

			$.template_effect(
				($0) => {
					$.set_attribute(a_1, 'href', $0);
					$.set_text(text_2, `Next #${$.get(next_show).number ?? ''} →`);
					$.set_text(text_3, $.get(next_show).title);
				},
				[() => get_show_path($.get(next_show))]
			);

			$.append($$anchor, a_1);
		};

		$.if(node_1, ($$render) => {
			if ($.get(next_show)) $$render(consequent_1);
		});
	}

	$.reset(div_3);
	$.reset(nav);
	$.reset(div);

	var div_4 = $.sibling(div, 2);
	var node_2 = $.child(div_4);

	{
		var consequent_2 = ($$anchor) => {
			var div_5 = root_3();
			var node_3 = $.sibling($.child(div_5), 2);

			$.each(node_3, 17, () => $.get(show).videos, $.index, ($$anchor, $$item) => {
				let video = () => $.get($$item).video;
				var a_2 = root_2();
				var img = $.only_child(a_2);

				$.template_effect(() => {
					$.set_attribute(a_2, 'href', `/videos/${video().playlists[0].playlist.slug}/${video().slug}`);
					$.set_attribute(img, 'src', video().thumbnail);
					$.set_attribute(img, 'alt', video().title);
				});

				$.append($$anchor, a_2);
			});

			$.reset(div_5);
			$.append($$anchor, div_5);
		};

		$.if(node_2, ($$render) => {
			if ($.get(show)?.videos?.length > 0) $$render(consequent_2);
		});
	}

	var div_6 = $.sibling(node_2, 2);
	var node_4 = $.child(div_6);

	SwaggyNewsletterForm(node_4, {});
	$.reset(div_6);
	$.reset(div_4);
	$.append($$anchor, fragment);
	$.pop();
}