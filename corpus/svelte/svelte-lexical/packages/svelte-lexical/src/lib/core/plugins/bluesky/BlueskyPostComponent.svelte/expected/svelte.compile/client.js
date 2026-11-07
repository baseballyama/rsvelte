import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { renderPost, fetchPost } from 'bluesky-post-embed/core';
import BlockWithAlignableContents from '../BlockWithAlignableContents.svelte';

var root = $.from_html(`<bluesky-post></bluesky-post>`, 2);
var root_1 = $.from_html(`<p>...rendering</p>`);
var root_2 = $.from_html(`<p>...loading</p>`);
var root_3 = $.from_html(`<div style="display: inline-block; width: 550px"><!></div>`);

export default function BlueskyPostComponent($$anchor, $$props) {
	$.push($$props, true);

	const data = $.derived(() => fetchPost({
		uri: `at://${$$props.profile}/app.bsky.feed.post/${$$props.postKey}`
	}));

	BlockWithAlignableContents($$anchor, {
		get className() {
			return $$props.className;
		},

		get format() {
			return $$props.format;
		},

		get nodeKey() {
			return $$props.nodeKey;
		},

		children: ($$anchor, $$slotProps) => {
			var div = root_3();
			var node = $.child(div);

			$.await(
				node,
				() => $.get(data),
				($$anchor) => {
					var p_1 = root_2();

					$.append($$anchor, p_1);
				},
				($$anchor, data) => {
					const render = $.derived(() => renderPost($.get(data)));
					var fragment_1 = $.comment();
					var node_1 = $.first_child(fragment_1);

					$.await(
						node_1,
						() => $.get(render),
						($$anchor) => {
							var p = root_1();

							$.append($$anchor, p);
						},
						($$anchor, render) => {
							var bluesky_post = root();

							$.template_effect(() => $.set_custom_element_data(bluesky_post, 'src', $.get(data).thread?.post.uri));
							$.html(bluesky_post, () => $.get(render), true);
							$.reset(bluesky_post);
							$.append($$anchor, bluesky_post);
						}
					);

					$.append($$anchor, fragment_1);
				}
			);

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}