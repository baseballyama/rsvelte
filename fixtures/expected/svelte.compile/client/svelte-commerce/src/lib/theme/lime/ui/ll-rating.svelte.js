import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Star } from '@lucide/svelte';

var root = $.from_html(`<span><!></span>`);
var root_1 = $.from_html(`<span class="ll-rating-count svelte-19vthga"> </span>`);
var root_2 = $.from_html(`<div class="ll-rating svelte-19vthga"><div class="ll-rating-stars svelte-19vthga"></div> <!></div>`);

export default function Ll_rating($$anchor, $$props) {
	/**
	 * Lime rating primitive — a quiet 5-star row.
	 * Renders filled / half / empty stars in the plum brand tone.
	 */
	let value = $.prop($$props, 'value', 3, 0),
		size = $.prop($$props, 'size', 3, 14);

	const stars = $.derived(() => Array.from({ length: 5 }, (_, i) => {
		const fill = Math.max(0, Math.min(1, value() - i));

		return fill >= 0.75 ? 'full' : fill >= 0.25 ? 'half' : 'empty';
	}));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent_1 = ($$anchor) => {
			var div = root_2();
			var div_1 = $.child(div);

			$.each(div_1, 21, () => $.get(stars), $.index, ($$anchor, state) => {
				var span = root();
				var node_1 = $.child(span);

				Star(node_1, {
					get style() {
						return `width:${size() ?? ''}px; height:${size() ?? ''}px;`;
					},
					strokeWidth: 1.25
				});

				$.reset(span);

				$.template_effect(() => {
					$.set_class(span, 1, `ll-star ll-star--${$.get(state) ?? ''}`, 'svelte-19vthga');
					$.set_style(span, `width:${size() ?? ''}px; height:${size() ?? ''}px;`);
				});

				$.append($$anchor, span);
			});

			$.reset(div_1);

			var node_2 = $.sibling(div_1, 2);

			{
				var consequent = ($$anchor) => {
					var span_1 = root_1();
					var text = $.only_child(span_1);

					$.template_effect(() => $.set_text(text, `(${$$props.count ?? ''})`));
					$.append($$anchor, span_1);
				};

				$.if(node_2, ($$render) => {
					if ($$props.count != null) $$render(consequent);
				});
			}

			$.reset(div);
			$.template_effect(() => $.set_attribute(div, 'aria-label', `Rated ${value() ?? ''} out of 5`));
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if (value() > 0) $$render(consequent_1);
		});
	}

	$.append($$anchor, fragment);
}