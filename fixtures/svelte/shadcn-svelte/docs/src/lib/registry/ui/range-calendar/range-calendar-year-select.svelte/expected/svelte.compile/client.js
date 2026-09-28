import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { RangeCalendar as RangeCalendarPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class', 'value']);
var root = $.from_html(`<option> </option>`);
var root_1 = $.from_html(`<select></select> <span class="flex h-(--cell-size) items-center gap-1 rounded-md ps-2 pe-1 text-sm font-medium select-none [&amp;>svg]:size-3.5 [&amp;>svg]:text-muted-foreground" aria-hidden="true"> <!></span>`, 1);
var root_2 = $.from_html(`<span><!></span>`);

export default function Range_calendar_year_select($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var span = root_2();
	var node = $.child(span);

	{
		const child = ($$anchor, $$arg0) => {
			let props = () => ($$arg0?.()).props;
			let yearItems = () => ($$arg0?.()).yearItems;
			let selectedYearItem = () => ($$arg0?.()).selectedYearItem;
			var fragment = root_1();
			var select = $.first_child(fragment);

			$.attribute_effect(select, () => ({ ...props(), value: $$props.value }));

			$.each(select, 21, yearItems, (yearItem) => yearItem.value, ($$anchor, yearItem) => {
				var option = root();
				var text = $.only_child(option, true);
				var option_value = {};

				$.template_effect(() => {
					$.set_selected(option, $$props.value !== undefined
						? $.get(yearItem).value === $$props.value
						: $.get(yearItem).value === selectedYearItem().value);

					$.set_text(text, $.get(yearItem).label);

					if (option_value !== (option_value = $.get(yearItem).value)) {
						option.value = (option.__value = option_value) ?? '';
					}
				});

				$.append($$anchor, option);
			});

			$.reset(select);

			var span_1 = $.sibling(select, 2);
			var text_1 = $.child(span_1);
			var node_1 = $.sibling(text_1);

			{
				let $0 = $.derived(() => cn("size-4", $$props.class));

				IconPlaceholder(node_1, {
					lucide: 'ChevronDownIcon',
					tabler: 'IconChevronDown',
					hugeicons: 'ArrowDownIcon',
					phosphor: 'CaretDownIcon',
					remixicon: 'RiArrowDownSLine',
					get class() {
						return $.get($0);
					}
				});
			}

			$.reset(span_1);

			$.template_effect(($0) => $.set_text(text_1, `${$0 ?? ''} `), [
				() => yearItems().find((item) => item.value === $$props.value)?.label || selectedYearItem().label
			]);

			$.append($$anchor, fragment);
		};

		$.component(node, () => RangeCalendarPrimitive.YearSelect, ($$anchor, RangeCalendarPrimitive_YearSelect) => {
			RangeCalendarPrimitive_YearSelect($$anchor, $.spread_props({ class: 'absolute inset-0 opacity-0' }, () => restProps, {
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
		() => $.clsx(cn("relative flex rounded-md border border-input shadow-xs has-focus:border-ring has-focus:ring-[3px] has-focus:ring-ring/50", $$props.class))
	]);

	$.append($$anchor, span);
	$.pop();
}