import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useSwitch } from '../modules/provider.svelte';
import { SwitchRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';
import { splitProps } from '@zag-js/switch';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<label><!></label>`);

export default function Root($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);

	const $$d = $.derived(() => splitProps(props)),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		switchProps = $.derived(() => $.get($$array)[0]),
		componentProps = $.derived(() => $.get($$array)[1]);

	const element = $.derived(() => $.get(componentProps).element),
		children = $.derived(() => $.get(componentProps).children),
		rest = $.derived(() => $.exclude_from_object($.get(componentProps), ['element', 'children']));

	const switch_ = useSwitch(() => ({ ...$.get(switchProps), id }));
	const attributes = $.derived(() => mergeProps(switch_().getRootProps(), $.get(rest)));

	SwitchRootContext.provide(() => switch_());

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
			var label = root();

			$.attribute_effect(label, () => ({ ...$.get(attributes) }));

			var node_2 = $.child(label);

			$.snippet(node_2, () => $.get(children) ?? $.noop);
			$.reset(label);
			$.append($$anchor, label);
		};

		$.if(node, ($$render) => {
			if ($.get(element)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}