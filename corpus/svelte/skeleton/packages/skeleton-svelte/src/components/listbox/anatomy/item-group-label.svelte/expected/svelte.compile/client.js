import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ListboxItemGroupContext } from '../modules/item-group-context.js';
import { ListboxRootContext } from '../modules/root-context.js';
import { splitItemGroupLabelProps } from '@zag-js/listbox';
import { mergeProps } from '@zag-js/svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<div><!></div>`);

export default function Item_group_label($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);
	const listbox = ListboxRootContext.consume();
	const itemGroupProps = ListboxItemGroupContext.consume();

	const $$d = $.derived(() => splitItemGroupLabelProps({ htmlFor: itemGroupProps().id, ...props })),
		$$array = $.derived(() => $.to_array($.get($$d), 1)),
		itemGroupLabelProps = $.derived(() => $.get($$array)[0]);

	const element = $.derived(() => $$props.element),
		children = $.derived(() => $$props.children),
		rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

	const attributes = $.derived(() => mergeProps(listbox().getItemGroupLabelProps($.get(itemGroupLabelProps)), $.get(rest)));
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
			var div = root();

			$.attribute_effect(div, () => ({ ...$.get(attributes) }));

			var node_2 = $.child(div);

			$.snippet(node_2, () => $.get(children) ?? $.noop);
			$.reset(div);
			$.append($$anchor, div);
		};

		$.if(node, ($$render) => {
			if ($.get(element)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}