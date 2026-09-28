import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Timeline from '@sveltepress/theme-blog/components/Timeline.svelte';
import { posts } from 'virtual:sveltepress/blog-posts-meta';

export default function _page($$anchor) {
	Timeline($$anchor, {
		get posts() {
			return posts;
		}
	});
}