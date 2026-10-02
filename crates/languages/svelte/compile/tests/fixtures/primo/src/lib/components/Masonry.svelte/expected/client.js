import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Skeleton } from '$lib/components/ui/skeleton';

var root = $.from_html(`<li><!></li>`);
var root_1 = $.from_html(`<ul class="svelte-99y4nj"></ul>`);
var root_2 = $.from_html(`<div><!></div>`);

export default function Masonry($$anchor, $$props) {
	$.push($$props, true);

	let loading = $.prop($$props, 'loading', 3, false),
		className = $.prop($$props, 'class', 3, ''),
		columnCount = $.prop($$props, 'columnCount', 3, null),
		skeletonCount = $.prop($$props, 'skeletonCount', 3, 8),
		getKey = $.prop($$props, 'getKey', 3, (item) => item?.id ?? item?.key ?? item);

	// Dynamically determine number of columns based on screen width
	let window_width = $.state($.proxy(typeof window !== 'undefined' ? window.innerWidth : 1200));

	$.user_effect(() => {
		const handle_resize = () => {
			$.set(window_width, window.innerWidth, true);
		};

		window.addEventListener('resize', handle_resize);

		return () => window.removeEventListener('resize', handle_resize);
	});

	const columns = $.derived(() => columnCount() ?? ($.get(window_width) < 600
		? 1
		: $.get(window_width) < 700 ? 2 : $.get(window_width) < 1200 ? 3 : 4));

	// Generate random ratios for skeleton cards
	const skeleton_ratios = $.derived(() => Array.from({ length: $.get(columns) }, () => Array.from({ length: Math.ceil(skeletonCount() / $.get(columns)) }, () => 0.5 + Math.random())));

	// Split items into columns for masonry layout
	const columnized_items = $.derived(() => $$props.items
		? Array.from({ length: $.get(columns) }, (_, i) => $$props.items.filter((_, index) => index % $.get(columns) === i))
		: []);

	var div = root_2();
	let styles;
	var node = $.child(div);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.each(node_1, 17, () => $.get(skeleton_ratios), $.index, ($$anchor, column_ratios) => {
				var ul = root_1();

				$.each(ul, 21, () => $.get(column_ratios), $.index, ($$anchor, ratio) => {
					var li = root();
					var node_2 = $.child(li);

					Skeleton(node_2, {
						class: 'w-full',
						get style() {
							return `aspect-ratio: ${$.get(ratio) ?? ''}`;
						}
					});

					$.reset(li);
					$.append($$anchor, li);
				});

				$.reset(ul);
				$.append($$anchor, ul);
			});

			$.append($$anchor, fragment);
		};

		var alternate = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_3 = $.first_child(fragment_1);

			$.each(node_3, 17, () => $.get(columnized_items), $.index, ($$anchor, column) => {
				var ul_1 = root_1();

				$.each(ul_1, 21, () => $.get(column), (item) => getKey()(item), ($$anchor, item) => {
					var li_1 = root();
					var node_4 = $.child(li_1);

					$.snippet(node_4, () => $$props.children, () => $.get(item));
					$.reset(li_1);
					$.append($$anchor, li_1);
				});

				$.reset(ul_1);
				$.append($$anchor, ul_1);
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if (loading() || $$props.items === undefined) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(div);

	$.template_effect(() => {
		$.set_class(div, 1, `masonry ${className() ?? ''}`, 'svelte-99y4nj');

		styles = $.set_style(div, '', styles, {
			'grid-template-columns': `repeat(${$.get(columns) ?? ''}, 1fr)`
		});
	});

	$.append($$anchor, div);
	$.pop();
}