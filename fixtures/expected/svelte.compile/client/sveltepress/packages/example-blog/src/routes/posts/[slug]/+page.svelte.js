import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PostLayout from '@sveltepress/theme-blog/PostLayout.svelte';

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const post = $.derived(() => $$props.data.post);
	const prev = $.derived(() => $$props.data.prev);
	const next = $.derived(() => $$props.data.next);

	PostLayout($$anchor, {
		get post() {
			return $.get(post);
		},

		get prev() {
			return $.get(prev);
		},

		get next() {
			return $.get(next);
		}
	});

	$.pop();
}