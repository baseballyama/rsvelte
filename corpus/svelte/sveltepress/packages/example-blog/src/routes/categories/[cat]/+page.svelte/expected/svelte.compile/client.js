import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import MasonryGrid from '@sveltepress/theme-blog/components/MasonryGrid.svelte';
import TaxonomyHeader from '@sveltepress/theme-blog/components/TaxonomyHeader.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	const category = $.derived(() => $$props.data.category);
	const posts = $.derived(() => $$props.data.posts);
	var fragment = root();
	var node = $.first_child(fragment);

	TaxonomyHeader(node, {
		get name() {
			return $.get(category);
		},

		get count() {
			return $.get(posts).length;
		},
		type: 'category'
	});

	var node_1 = $.sibling(node, 2);

	MasonryGrid(node_1, {
		get posts() {
			return $.get(posts);
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}