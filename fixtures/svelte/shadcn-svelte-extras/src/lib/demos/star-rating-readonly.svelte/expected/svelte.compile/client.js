import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as StarRating from '$lib/components/ui/star-rating';

export default function Star_rating_readonly($$anchor) {
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		const children = ($$anchor, $$arg0) => {
			let items = () => ($$arg0?.()).items;
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.each(node_1, 17, items, (item) => item.index, ($$anchor, item) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.component(node_2, () => StarRating.Star, ($$anchor, StarRating_Star) => {
					StarRating_Star($$anchor, $.spread_props(() => $.get(item)));
				});

				$.append($$anchor, fragment_2);
			});

			$.append($$anchor, fragment_1);
		};

		$.component(node, () => StarRating.Root, ($$anchor, StarRating_Root) => {
			StarRating_Root($$anchor, {
				readonly: true,
				value: 2,
				children,
				$$slots: { default: true }
			});
		});
	}

	$.append($$anchor, fragment);
}