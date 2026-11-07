import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import StarEmpty from '../../../internal/components/star-empty.svelte';
import StarFull from '../../../internal/components/star-full.svelte';
import StarHalf from '../../../internal/components/star-half.svelte';
import { RatingGroupRootContext } from '../modules/root-context.js';
import { splitItemProps } from '@zag-js/rating-group';
import { mergeProps } from '@zag-js/svelte';

const starEmpty = ($$anchor) => {
	StarEmpty($$anchor, {});
};

const starHalf = ($$anchor) => {
	StarHalf($$anchor, {});
};

const starFull = ($$anchor) => {
	StarFull($$anchor, {});
};

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<div><!></div>`);

export default function Item($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);
	const ratingGroup = RatingGroupRootContext.consume();

	const $$d = $.derived(() => splitItemProps(props)),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		itemProps = $.derived(() => $.get($$array)[0]),
		componentProps = $.derived(() => $.get($$array)[1]);

	const element = $.derived(() => $.get(componentProps).element),
		children = $.derived(() => $.get(componentProps).children),
		empty = $.derived(() => $.fallback($.get(componentProps).empty, starEmpty)),
		half = $.derived(() => $.fallback($.get(componentProps).half, starHalf)),
		full = $.derived(() => $.fallback($.get(componentProps).full, starFull)),
		rest = $.derived(() => $.exclude_from_object($.get(componentProps), ['element', 'children', 'empty', 'half', 'full']));

	const itemState = $.derived(() => ratingGroup().getItemState($.get(itemProps)));
	const attributes = $.derived(() => mergeProps(ratingGroup().getItemProps($.get(itemProps)), $.get(rest)));
	var fragment_3 = $.comment();
	var node = $.first_child(fragment_3);

	{
		var consequent = ($$anchor) => {
			var fragment_4 = $.comment();
			var node_1 = $.first_child(fragment_4);

			$.snippet(node_1, () => $.get(element), () => $.get(attributes));
			$.append($$anchor, fragment_4);
		};

		var alternate_1 = ($$anchor) => {
			var div = root();

			$.attribute_effect(div, () => ({ ...$.get(attributes) }));

			var node_2 = $.child(div);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_5 = $.comment();
					var node_3 = $.first_child(fragment_5);

					$.snippet(node_3, () => $.get(children));
					$.append($$anchor, fragment_5);
				};

				var consequent_2 = ($$anchor) => {
					var fragment_6 = $.comment();
					var node_4 = $.first_child(fragment_6);

					$.snippet(node_4, () => $.get(empty) ?? $.noop);
					$.append($$anchor, fragment_6);
				};

				var consequent_3 = ($$anchor) => {
					var fragment_7 = $.comment();
					var node_5 = $.first_child(fragment_7);

					$.snippet(node_5, () => $.get(half) ?? $.noop);
					$.append($$anchor, fragment_7);
				};

				var alternate = ($$anchor) => {
					var fragment_8 = $.comment();
					var node_6 = $.first_child(fragment_8);

					$.snippet(node_6, () => $.get(full) ?? $.noop);
					$.append($$anchor, fragment_8);
				};

				$.if(node_2, ($$render) => {
					if ($.get(children)) $$render(consequent_1); else if (!$.get(itemState).highlighted) $$render(consequent_2, 1); else if ($.get(itemState).half) $$render(consequent_3, 2); else $$render(alternate, -1);
				});
			}

			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(element)) $$render(consequent); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment_3);
	$.pop();
}