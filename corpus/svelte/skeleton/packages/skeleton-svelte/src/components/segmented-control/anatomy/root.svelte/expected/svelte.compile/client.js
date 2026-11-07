import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useSegmentedControl } from '../modules/provider.svelte';
import { SegmentedControlRootContext } from '../modules/root-context.js';
import { splitProps } from '@zag-js/radio-group';
import { mergeProps } from '@zag-js/svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<div><!></div>`);

export default function Root($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);

	const $$d = $.derived(() => splitProps(props)),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		segmentedControlProps = $.derived(() => $.get($$array)[0]),
		componentProps = $.derived(() => $.get($$array)[1]);

	const element = $.derived(() => $.get(componentProps).element),
		children = $.derived(() => $.get(componentProps).children),
		rest = $.derived(() => $.exclude_from_object($.get(componentProps), ['element', 'children']));

	const segmentedControl = useSegmentedControl(() => ({ ...$.get(segmentedControlProps), id }));
	const attributes = $.derived(() => mergeProps(segmentedControl().getRootProps(), $.get(rest)));

	SegmentedControlRootContext.provide(() => segmentedControl());

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