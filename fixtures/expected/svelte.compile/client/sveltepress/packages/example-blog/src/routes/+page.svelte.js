import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MasonryGrid from '@sveltepress/theme-blog/components/MasonryGrid.svelte';
import Pagination from '@sveltepress/theme-blog/components/Pagination.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const posts = $.derived(() => $$props.data.posts);
	var fragment = root();
	var node = $.first_child(fragment);

	MasonryGrid(node, {
		get posts() {
			return $.get(posts);
		}
	});

	var node_1 = $.sibling(node, 2);

	Pagination(node_1, {
		get page() {
			return $$props.data.page;
		},

		get total() {
			return $$props.data.total;
		},

		get pageSize() {
			return $$props.data.pageSize;
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}