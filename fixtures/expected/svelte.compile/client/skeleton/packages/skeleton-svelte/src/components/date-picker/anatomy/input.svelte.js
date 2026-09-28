import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DatePickerRootContext } from '../modules/root-context.js';
import { splitInputProps } from '@zag-js/date-picker';
import { mergeProps } from '@zag-js/svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<input/>`);

export default function Input($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);
	const datePicker = DatePickerRootContext.consume();

	const $$d = $.derived(() => splitInputProps(props)),
		$$array = $.derived(() => $.to_array($.get($$d), 2)),
		inputProps = $.derived(() => $.get($$array)[0]),
		componentProps = $.derived(() => $.get($$array)[1]);

	const element = $.derived(() => $.get(componentProps).element),
		rest = $.derived(() => $.exclude_from_object($.get(componentProps), ['element']));

	const attributes = $.derived(() => mergeProps(datePicker().getInputProps($.get(inputProps)), $.get(rest)));
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
			var input = root();

			$.attribute_effect(input, () => ({ ...$.get(attributes) }), void 0, void 0, void 0, void 0, true);
			$.append($$anchor, input);
		};

		$.if(node, ($$render) => {
			if ($.get(element)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}