import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
import { formatDateRange } from "little-date";
import * as Popover from "$lib/registry/ui/popover/index.js";
import RangeCalendar from "$lib/registry/ui/range-calendar/range-calendar.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="flex flex-col gap-3"><!> <!></div>`);

export default function Calendar_30($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	let value = $.state($.proxy({
		start: new CalendarDate(2025, 6, 4),
		end: new CalendarDate(2025, 6, 10)
	}));

	function formatRange(start, end) {
		return formatDateRange(start.toDate(getLocalTimeZone()), end.toDate(getLocalTimeZone()), { includeTime: false });
	}

	var div = root_1();
	var node = $.child(div);

	Label(node, {
		get for() {
			return `${id}-dates`;
		},
		class: 'px-1',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Select your stay');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_2 = $.first_child(fragment);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props(props, {
							variant: 'outline',
							class: 'w-56 justify-between font-normal',
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root();
								var node_3 = $.first_child(fragment_2);

								{
									var consequent = ($$anchor) => {
										var text_1 = $.text();

										$.template_effect(($0) => $.set_text(text_1, $0), [() => formatRange($.get(value).start, $.get(value).end)]);
										$.append($$anchor, text_1);
									};

									var alternate = ($$anchor) => {
										var text_2 = $.text('Select date');

										$.append($$anchor, text_2);
									};

									$.if(node_3, ($$render) => {
										if ($.get(value)?.start && $.get(value)?.end) $$render(consequent); else $$render(alternate, -1);
									});
								}

								var node_4 = $.sibling(node_3, 2);

								ChevronDownIcon(node_4, {});
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						}));
					};

					$.component(node_2, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, {
							get id() {
								return `${id}-dates`;
							},
							child,
							$$slots: { child: true }
						});
					});
				}

				var node_5 = $.sibling(node_2, 2);

				$.component(node_5, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						class: 'w-auto overflow-hidden p-0',
						align: 'start',
						children: ($$anchor, $$slotProps) => {
							RangeCalendar($$anchor, {
								captionLayout: 'dropdown',
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								}
							});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}