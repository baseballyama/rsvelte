import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CalendarYearSelectState } from "../calendar.svelte.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'child',
	'ref',
	'id',
	'years',
	'yearFormat',
	'disabled',
	'aria-label'
]);

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<select><!></select>`);

export default function Calendar_year_select($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		yearFormat = $.prop($$props, 'yearFormat', 3, "numeric"),
		disabled = $.prop($$props, 'disabled', 3, false),
		ariaLabel = $.prop($$props, 'aria-label', 3, "Select a year"),
		restProps = $.rest_props($$props, rest_excludes);

	const yearSelectState = CalendarYearSelectState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		years: boxWith(() => $$props.years),
		yearFormat: boxWith(() => yearFormat()),
		disabled: boxWith(() => Boolean(disabled()))
	});

	const mergedProps = $.derived(() => mergeProps(restProps, yearSelectState.props, { "aria-label": ariaLabel() }));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => ({ props: $.get(mergedProps), ...yearSelectState.snippetProps }));

				$.snippet(node_1, () => $$props.child, () => $.get($0));
			}

			$.append($$anchor, fragment_1);
		};

		var alternate_1 = ($$anchor) => {
			var select = root_1();

			$.attribute_effect(select, () => ({ ...$.get(mergedProps) }));

			$.customizable_select(select, () => {
				var anchor = $.child(select);
				var fragment_2 = $.comment();
				var node_2 = $.first_child(fragment_2);

				{
					var consequent_1 = ($$anchor) => {
						var fragment_3 = $.comment();
						var node_3 = $.first_child(fragment_3);

						$.snippet(node_3, () => $$props.children ?? $.noop, () => yearSelectState.snippetProps);
						$.append($$anchor, fragment_3);
					};

					var alternate = ($$anchor) => {
						var fragment_4 = $.comment();
						var node_4 = $.first_child(fragment_4);

						$.each(node_4, 17, () => yearSelectState.yearItems, (year) => year.value, ($$anchor, year) => {
							var option = root();
							var text = $.only_child(option, true);
							var option_value = {};

							$.template_effect(() => {
								$.set_selected(option, $.get(year).value === yearSelectState.currentYear);
								$.set_text(text, $.get(year).label);

								if (option_value !== (option_value = $.get(year).value)) {
									option.value = (option.__value = option_value) ?? '';
								}
							});

							$.append($$anchor, option);
						});

						$.append($$anchor, fragment_4);
					};

					$.if(node_2, ($$render) => {
						if ($$props.children) $$render(consequent_1); else $$render(alternate, -1);
					});
				}

				$.append(anchor, fragment_2);
			});

			$.append($$anchor, select);
		};

		$.if(node, ($$render) => {
			if ($$props.child) $$render(consequent); else $$render(alternate_1, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}