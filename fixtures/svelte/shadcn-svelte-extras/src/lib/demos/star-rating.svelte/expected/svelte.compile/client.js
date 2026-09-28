import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as StarRating from '$lib/components/ui/star-rating';

var root = $.from_html(`<div><!> <span class="text-muted-foreground text-sm"> </span></div>`);

export default function Star_rating($$anchor) {
	let value = $.state(0);
	var div = root();
	var node = $.child(div);

	{
		const children = ($$anchor, $$arg0) => {
			let items = () => ($$arg0?.()).items;
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, items, (item) => item.index, ($$anchor, item) => {
				var fragment_1 = $.comment();
				var node_2 = $.first_child(fragment_1);

				$.component(node_2, () => StarRating.Star, ($$anchor, StarRating_Star) => {
					StarRating_Star($$anchor, $.spread_props(() => $.get(item)));
				});

				$.append($$anchor, fragment_1);
			});

			$.append($$anchor, fragment);
		};

		$.component(node, () => StarRating.Root, ($$anchor, StarRating_Root) => {
			StarRating_Root($$anchor, {
				get value() {
					return $.get(value);
				},

				set value($$value) {
					$.set(value, $$value, true);
				},
				children,
				$$slots: { default: true }
			});
		});
	}

	var span = $.sibling(node, 2);
	var text = $.only_child(span);

	$.reset(div);
	$.template_effect(() => $.set_text(text, `Rating is ${$.get(value) ?? ''}`));
	$.append($$anchor, div);
}