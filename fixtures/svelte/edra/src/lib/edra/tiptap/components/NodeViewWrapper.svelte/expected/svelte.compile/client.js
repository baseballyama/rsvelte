import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'as', 'class', 'children']);

export default function NodeViewWrapper($$anchor, $$props) {
	$.push($$props, true);

	let as = $.prop($$props, 'as', 3, 'div'),
		props = $.rest_props($$props, rest_excludes);

	let onDragStartCtx = getContext('onDragStart');
	let decorationClassesCtx = getContext('decorationClasses');

	let combinedClass = $.derived(() => [
		typeof decorationClassesCtx === 'function' ? decorationClassesCtx() : decorationClassesCtx,
		$$props.class
	].filter(Boolean).join(' ') || undefined);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, as, false, ($$element, $$anchor) => {
		$.attribute_effect(
			$$element,
			($0) => ({
				'data-node-view-wrapper': 'hello',
				class: $.get(combinedClass),
				style: 'white-space: normal',
				ondragstart: $0,
				...props
			}),
			[() => onDragStartCtx()]
		);

		var fragment_1 = $.comment();
		var node_1 = $.first_child(fragment_1);

		{
			var consequent = ($$anchor) => {
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				$.snippet(node_2, () => $$props.children);
				$.append($$anchor, fragment_2);
			};

			$.if(node_1, ($$render) => {
				if ($$props.children) $$render(consequent);
			});
		}

		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}