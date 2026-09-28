import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Check from '../../../internal/components/check.svelte';
import { ListboxItemContext } from '../modules/item-context.js';
import { ListboxRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

const check = ($$anchor) => {
	Check($$anchor, { class: 'size-4' });
};

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<span><!></span>`);

export default function Item_indicator($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);
	const listbox = ListboxRootContext.consume();
	const itemProps = ListboxItemContext.consume();

	const element = $.derived(() => $$props.element),
		children = $.derived(() => $.fallback($$props.children, check)),
		rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

	const attributes = $.derived(() => mergeProps(listbox().getItemIndicatorProps(itemProps()), $.get(rest)));
	var fragment_1 = $.comment();
	var node = $.first_child(fragment_1);

	{
		var consequent = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_1 = $.first_child(fragment_2);

			$.snippet(node_1, () => $.get(element), () => $.get(attributes));
			$.append($$anchor, fragment_2);
		};

		var alternate = ($$anchor) => {
			var span = root();

			$.attribute_effect(span, () => ({ ...$.get(attributes) }));

			var node_2 = $.child(span);

			$.snippet(node_2, () => $.get(children) ?? $.noop);
			$.reset(span);
			$.append($$anchor, span);
		};

		$.if(node, ($$render) => {
			if ($.get(element)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment_1);
	$.pop();
}