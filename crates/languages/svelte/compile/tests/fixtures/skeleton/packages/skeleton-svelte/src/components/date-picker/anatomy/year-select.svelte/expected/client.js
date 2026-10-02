import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DatePickerRootContext } from '../modules/root-context.js';
import { mergeProps } from '@zag-js/svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);
var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<select></select>`);

export default function Year_select($$anchor, $$props) {
	$.push($$props, true);

	const props = $.rest_props($$props, rest_excludes);
	const datePicker = DatePickerRootContext.consume();

	const element = $.derived(() => $$props.element),
		rest = $.derived(() => $.exclude_from_object(props, ['element']));

	const attributes = $.derived(() => mergeProps(datePicker().getYearSelectProps(), $.get(rest)));
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
			var select = root_1();

			$.attribute_effect(select, () => ({ ...$.get(attributes) }));

			$.each(select, 21, () => datePicker().getYears(), (year) => year.value, ($$anchor, year) => {
				var option = root();
				var text = $.only_child(option, true);
				var option_value = {};

				$.template_effect(() => {
					$.set_text(text, $.get(year).label);

					if (option_value !== (option_value = $.get(year).value)) {
						option.value = (option.__value = option_value) ?? '';
					}
				});

				$.append($$anchor, option);
			});

			$.reset(select);
			$.append($$anchor, select);
		};

		$.if(node, ($$render) => {
			if ($.get(element)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}