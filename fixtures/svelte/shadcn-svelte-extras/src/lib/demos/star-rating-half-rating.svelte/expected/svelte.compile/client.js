import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as StarRating from '$lib/components/ui/star-rating';

var root = $.from_html(`<div class="flex flex-col gap-2"><div><!> <span class="text-muted-foreground text-sm"> </span></div> <div dir="rtl"><span class="text-muted-foreground text-sm">تقييم بالنجوم (RTL)</span> <!></div></div>`);

export default function Star_rating_half_rating($$anchor) {
	let value = $.state(3.5);
	var div = root();
	var div_1 = $.child(div);
	var node = $.child(div_1);

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
				allowHalf: true,
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

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_3 = $.sibling($.child(div_2), 2);

	{
		const children = ($$anchor, $$arg0) => {
			let items = () => ($$arg0?.()).items;
			var fragment_2 = $.comment();
			var node_4 = $.first_child(fragment_2);

			$.each(node_4, 17, items, (item) => item.index, ($$anchor, item) => {
				var fragment_3 = $.comment();
				var node_5 = $.first_child(fragment_3);

				$.component(node_5, () => StarRating.Star, ($$anchor, StarRating_Star_1) => {
					StarRating_Star_1($$anchor, $.spread_props(() => $.get(item)));
				});

				$.append($$anchor, fragment_3);
			});

			$.append($$anchor, fragment_2);
		};

		$.component(node_3, () => StarRating.Root, ($$anchor, StarRating_Root_1) => {
			StarRating_Root_1($$anchor, {
				allowHalf: true,
				value: 3.5,
				children,
				$$slots: { default: true }
			});
		});
	}

	$.reset(div_2);
	$.reset(div);

	$.template_effect(() => {
		$.set_text(text, `Rating is ${$.get(value) ?? ''}`);
		div_2.dir = div_2.dir;
	});

	$.append($$anchor, div);
}