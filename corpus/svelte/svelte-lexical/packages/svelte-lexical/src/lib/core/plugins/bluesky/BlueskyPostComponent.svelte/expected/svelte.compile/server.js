import * as $ from 'svelte/internal/server';
import { renderPost, fetchPost } from 'bluesky-post-embed/core';
import BlockWithAlignableContents from '../BlockWithAlignableContents.svelte';

export default function BlueskyPostComponent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { className, format, nodeKey, profile, postKey } = $$props;
		const data = $.derived(() => fetchPost({ uri: `at://${profile}/app.bsky.feed.post/${postKey}` }));

		BlockWithAlignableContents($$renderer, {
			className,
			format,
			nodeKey,
			children: ($$renderer) => {
				$$renderer.push(`<div style="display: inline-block; width: 550px">`);

				$.await(
					$$renderer,
					data(),
					() => {
						$$renderer.push(`<p>...loading</p>`);
					},
					(data) => {
						const render = renderPost(data);

						$.await(
							$$renderer,
							render,
							() => {
								$$renderer.push(`<p>...rendering</p>`);
							},
							(render) => {
								$$renderer.push(`<bluesky-post${$.attr('src', data.thread?.post.uri)}>${$.html(render)}</bluesky-post>`);
							}
						);

						$$renderer.push(`<!--]-->`);
					}
				);

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});
	});
}