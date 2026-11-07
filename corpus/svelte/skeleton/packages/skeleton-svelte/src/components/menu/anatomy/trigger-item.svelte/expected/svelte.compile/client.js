import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { MenuItemContext } from '../modules/item-context.js';
import { MenuTriggerItemContext } from '../modules/trigger-item-context.js';
import { splitItemProps } from '@zag-js/menu';
import { mergeProps } from '@zag-js/svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<div><!></div>`);

export default function Trigger_item($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);
	const triggerItemProps = MenuTriggerItemContext.consume();

	const $$d = $.derived(() => splitItemProps(props)),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		itemProps = $.derived(() => $.get($$array)[0]),
		componentProps = $.derived(() => $.get($$array)[1]);

	const element = $.derived(() => $.get(componentProps).element),
		children = $.derived(() => $.get(componentProps).children),
		rest = $.derived(() => $.exclude_from_object($.get(componentProps), ['element', 'children']));

	const attributes = $.derived(() => mergeProps(triggerItemProps(), $.get(rest)));

	MenuItemContext.provide(() => $.get(itemProps));

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