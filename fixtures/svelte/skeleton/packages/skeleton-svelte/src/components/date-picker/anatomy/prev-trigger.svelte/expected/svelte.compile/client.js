import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronLeftIcon from '../../../internal/components/chevron-left.svelte';
import { DatePickerRootContext } from '../modules/root-context.js';
import { DatePickerViewContext } from '../modules/view-context.js';
import { mergeProps } from '@zag-js/svelte';

const chevronLeft = ($$anchor) => {
	ChevronLeftIcon($$anchor, {});
};

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<button><!></button>`);

export default function Prev_trigger($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);
	const datePicker = DatePickerRootContext.consume();
	const viewProps = DatePickerViewContext.consume();

	const element = $.derived(() => $$props.element),
		children = $.derived(() => $.fallback($$props.children, chevronLeft)),
		rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

	const attributes = $.derived(() => mergeProps(datePicker().getPrevTriggerProps(viewProps()), $.get(rest)));
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
			var button = root();

			$.attribute_effect(button, () => ({ ...$.get(attributes) }));

			var node_2 = $.child(button);

			$.snippet(node_2, () => $.get(children) ?? $.noop);
			$.reset(button);
			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if ($.get(element)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment_1);
	$.pop();
}