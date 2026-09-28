import * as $ from 'svelte/internal/server';
import PostCardFeatured from './PostCardFeatured.svelte';
import PostCardLarge from './PostCardLarge.svelte';
import PostCardSmall from './PostCardSmall.svelte';

export default function MasonryGrid($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { posts } = $$props;

		// First post becomes the featured card
		const featured = $.derived(() => posts[0]);

		const gridPosts = $.derived(() => posts.slice(1));

		$$renderer.push(`<div class="sp-masonry-wrap svelte-1pedet4">`);

		if (featured()) {
			$$renderer.push('<!--[0-->');
			PostCardFeatured($$renderer, { post: featured() });
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div class="sp-masonry svelte-1pedet4"><!--[-->`);

		const each_array = $.ensure_array_like(gridPosts());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let post = each_array[$$index];

			if (post.cover) {
				$$renderer.push('<!--[0-->');
				PostCardLarge($$renderer, { post });
			} else {
				$$renderer.push('<!--[-1-->');
				PostCardSmall($$renderer, { post });
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}