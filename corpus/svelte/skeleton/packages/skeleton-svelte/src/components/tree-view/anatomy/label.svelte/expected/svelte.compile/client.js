import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TreeViewRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function Label($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);
	const treeView = TreeViewRootContext.consume();

	const level = $.derived(() => $.fallback($$props.level, 3)),
		element = $.derived(() => $$props.element),
		children = $.derived(() => $$props.children),
		rest = $.derived(() => $.exclude_from_object(props, ['level', 'element', 'children']));

	const attributes = $.derived(() => mergeProps(treeView().getLabelProps(), $.get(rest)));
	const tag = $.derived(() => `h${$.get(level)}`);
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
			var fragment_2 = $.comment();
			var node_2 = $.first_child(fragment_2);

			$.element(node_2, () => $.get(tag), false, ($$element, $$anchor) => {
				$.attribute_effect($$element, () => ({ ...$.get(attributes) }));

				var fragment_3 = $.comment();
				var node_3 = $.first_child(fragment_3);

				$.snippet(node_3, () => $.get(children) ?? $.noop);
				$.append($$anchor, fragment_3);
			});

			$.append($$anchor, fragment_2);
		};

		$.if(node, ($$render) => {
			if ($.get(element)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}