import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";
import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'value',
	'onchange'
]);

var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<select></select> <span class="[&amp;>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md ps-2 pe-1 text-sm font-medium select-none [&amp;>svg]:size-3.5" aria-hidden="true"> <!></span>`, 1);
var root_2 = $.from_html(`<span><!></span>`);

export default function Range_calendar_month_select($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var span = root_2();
	var node = $.child(span);

	{
		const child = ($$anchor, $$arg0) => {
			let props = () => ($$arg0?.()).props;
			let monthItems = () => ($$arg0?.()).monthItems;
			let selectedMonthItem = () => ($$arg0?.()).selectedMonthItem;
			var fragment = root_1();
			var select = $.first_child(fragment);

			$.attribute_effect(select, () => ({ ...props(), value: $$props.value, onchange: $$props.onchange }));

			$.each(select, 21, monthItems, (monthItem) => monthItem.value, ($$anchor, monthItem) => {
				var option = root();
				var text = $.only_child(option, true);
				var option_value = {};

				$.template_effect(() => {
					$.set_selected(option, $$props.value !== undefined
						? $.get(monthItem).value === $$props.value
						: $.get(monthItem).value === selectedMonthItem().value);

					$.set_text(text, $.get(monthItem).label);

					if (option_value !== (option_value = $.get(monthItem).value)) {
						option.value = (option.__value = option_value) ?? '';
					}
				});

				$.append($$anchor, option);
			});

			$.reset(select);

			var span_1 = $.sibling(select, 2);
			var text_1 = $.child(span_1);
			var node_1 = $.sibling(text_1);

			ChevronDownIcon(node_1, { class: 'size-4' });
			$.reset(span_1);

			$.template_effect(($0) => $.set_text(text_1, `${$0 ?? ''} `), [
				() => monthItems().find((item) => item.value === $$props.value)?.label || selectedMonthItem().label
			]);

			$.append($$anchor, fragment);
		};

		$.component(node, () => RangeCalendarPrimitive.MonthSelect, ($$anchor, RangeCalendarPrimitive_MonthSelect) => {
			RangeCalendarPrimitive_MonthSelect($$anchor, $.spread_props({ class: 'absolute inset-0 opacity-0' }, () => restProps, {
				get ref() {
					return ref();
				},

				set ref($$value) {
					ref($$value);
				},
				child,
				$$slots: { child: true }
			}));
		});
	}

	$.reset(span);

	$.template_effect(($0) => $.set_class(span, 1, $0), [
		() => $.clsx(cn("has-focus:border-ring border-input has-focus:ring-ring/50 relative flex rounded-md border shadow-xs has-focus:ring-[3px]", $$props.class))
	]);

	$.append($$anchor, span);
	$.pop();
}