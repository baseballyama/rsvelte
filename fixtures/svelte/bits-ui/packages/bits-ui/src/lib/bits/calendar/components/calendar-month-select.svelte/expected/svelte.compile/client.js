import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { boxWith, mergeProps } from "svelte-toolbelt";
import { CalendarMonthSelectState } from "../calendar.svelte.js";
import { createId } from "$lib/internal/create-id.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'child',
	'ref',
	'id',
	'months',
	'monthFormat',
	'disabled',
	'aria-label'
]);

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<select><!></select>`);

export default function Calendar_month_select($$anchor, $$props) {
	const uid = $.props_id();

	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		id = $.prop($$props, 'id', 19, () => createId(uid)),
		months = $.prop($$props, 'months', 19, () => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
		monthFormat = $.prop($$props, 'monthFormat', 3, "long"),
		disabled = $.prop($$props, 'disabled', 3, false),
		ariaLabel = $.prop($$props, 'aria-label', 3, "Select a month"),
		restProps = $.rest_props($$props, rest_excludes);

	const monthSelectState = CalendarMonthSelectState.create({
		id: boxWith(() => id()),
		ref: boxWith(() => ref(), (v) => ref(v)),
		months: boxWith(() => months()),
		monthFormat: boxWith(() => monthFormat()),
		disabled: boxWith(() => Boolean(disabled()))
	});

	const mergedProps = $.derived(() => mergeProps(restProps, monthSelectState.props, { "aria-label": ariaLabel() }));
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => ({ props: $.get(mergedProps), ...monthSelectState.snippetProps }));

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

						$.snippet(node_3, () => $$props.children ?? $.noop, () => monthSelectState.snippetProps);
						$.append($$anchor, fragment_3);
					};

					var alternate = ($$anchor) => {
						var fragment_4 = $.comment();
						var node_4 = $.first_child(fragment_4);

						$.each(node_4, 17, () => monthSelectState.monthItems, (month) => month.value, ($$anchor, month) => {
							var option = root();
							var text = $.only_child(option, true);
							var option_value = {};

							$.template_effect(() => {
								$.set_selected(option, $.get(month).value === monthSelectState.currentMonth);
								$.set_text(text, $.get(month).label);

								if (option_value !== (option_value = $.get(month).value)) {
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