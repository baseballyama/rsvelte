import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TagsInputItemContext } from '../modules/item-context.js';
import { TagsInputRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';
import { splitItemProps } from '@zag-js/tags-input';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<span><!></span>`);

export default function Item($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);
	const tagsInput = TagsInputRootContext.consume();

	const $$d = $.derived(() => splitItemProps(props)),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		itemProps = $.derived(() => $.get($$array)[0]),
		componentProps = $.derived(() => $.get($$array)[1]);

	const element = $.derived(() => $.get(componentProps).element),
		children = $.derived(() => $.get(componentProps).children),
		rest = $.derived(() => $.exclude_from_object($.get(componentProps), ['element', 'children']));

	const attributes = $.derived(() => mergeProps(tagsInput().getItemProps($.get(itemProps)), $.get(rest)));

	TagsInputItemContext.provide(() => $.get(itemProps));

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $.get(element), () => $.get(attributes));
			$.append($$anchor, fragment_1);
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

	$.append($$anchor, fragment);
	$.pop();
}