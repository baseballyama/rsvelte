import * as $ from 'svelte/internal/server';
import Timeline from '@sveltepress/theme-blog/components/Timeline.svelte';
import { posts } from 'virtual:sveltepress/blog-posts-meta';

export default function _page($$renderer) {
	Timeline($$renderer, { posts });
}