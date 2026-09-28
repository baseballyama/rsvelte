import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PostCardFeatured from './PostCardFeatured.svelte';
import PostCardLarge from './PostCardLarge.svelte';
import PostCardSmall from './PostCardSmall.svelte';

var root = $.from_html(`<div class="sp-masonry-wrap svelte-1pedet4"><!> <div class="sp-masonry svelte-1pedet4"></div></div>`);

export default function MasonryGrid($$anchor, $$props) {
	$.push($$props, true);

	// First post becomes the featured card
	const featured = $.derived(() => $$props.posts[0]);

	const gridPosts = $.derived(() => $$props.posts.slice(1));
	var div = root();
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			PostCardFeatured($$anchor, {
				get post() {
					return $.get(featured);
				}
			});
		};

		$.if(node, ($$render) => {
			if ($.get(featured)) $$render(consequent);
		});
	}

	var div_1 = $.sibling(node, 2);

	$.each(div_1, 21, () => $.get(gridPosts), (post) => post.slug, ($$anchor, post) => {
		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		{
			var consequent_1 = ($$anchor) => {
				PostCardLarge($$anchor, {
					get post() {
						return $.get(post);
					}
				});
			};

			var alternate = ($$anchor) => {
				PostCardSmall($$anchor, {
					get post() {
						return $.get(post);
					}
				});
			};

			$.if(node_1, ($$render) => {
				if ($.get(post).cover) $$render(consequent_1); else $$render(alternate, -1);
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}