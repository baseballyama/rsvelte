import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DatePickerRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<div><!></div>`);

export default function Range_text($$anchor, $$props) {
	$.push($$props, true);

	const defaultChildren = ($$anchor) => {
		$.next();

		var text = $.text();

		$.template_effect(() => $.set_text(text, $.get(rangeText)));
		$.append($$anchor, text);
	};

	const props = $.rest_props($$props, rest_excludes);
	const datePicker = DatePickerRootContext.consume();

	const rangeText = $.derived(() => Array.from(new Set([
		datePicker().visibleRangeText.start,
		datePicker().visibleRangeText.end
	])).join(' - '));

	const element = $.derived(() => $$props.element),
		children = $.derived(() => $.fallback($$props.children, defaultChildren)),
		rest = $.derived(() => $.exclude_from_object(props, ['element', 'children']));

	const attributes = $.derived(() => mergeProps(datePicker().getRangeTextProps(), $.get(rest)));
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

	$.append($$anchor, fragment_1);
	$.pop();
}