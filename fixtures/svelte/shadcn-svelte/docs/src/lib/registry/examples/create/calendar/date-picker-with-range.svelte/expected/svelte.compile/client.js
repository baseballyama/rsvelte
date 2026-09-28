import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CalendarDate, DateFormatter, getLocalTimeZone } from "@internationalized/date";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { RangeCalendar } from "$lib/registry/ui/range-calendar/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Date_picker_with_range($$anchor, $$props) {
	$.push($$props, true);

	const df = new DateFormatter("en-US", { dateStyle: "medium" });
	const currentDate = new CalendarDate(2022, 1, 20);
	let date = $.state($.proxy({ start: currentDate, end: currentDate.add({ days: 20 }) }));

	Example($$anchor, {
		title: 'Date Picker Range',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Field, ($$anchor, Field_Field) => {
				Field_Field($$anchor, {
					class: 'mx-auto w-72',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Label, ($$anchor, Field_Label) => {
							Field_Label($$anchor, {
								for: 'date-picker-range',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Date Picker Range');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Popover.Root, ($$anchor, Popover_Root) => {
							Popover_Root($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_3 = $.first_child(fragment_3);

									{
										const child = ($$anchor, $$arg0) => {
											let props = () => ($$arg0?.()).props;

											Button($$anchor, $.spread_props(props, {
												variant: 'outline',
												id: 'date-picker-range',
												class: 'justify-start px-2.5 font-normal',
												children: ($$anchor, $$slotProps) => {
													var fragment_5 = root();
													var node_4 = $.first_child(fragment_5);

													IconPlaceholder(node_4, {
														lucide: 'CalendarIcon',
														tabler: 'IconCalendar',
														hugeicons: 'CalendarIcon',
														phosphor: 'CalendarBlankIcon',
														remixicon: 'RiCalendarLine',
														'data-icon': 'inline-start'
													});

													var node_5 = $.sibling(node_4, 2);

													{
														var consequent = ($$anchor) => {
															var text_1 = $.text();

															$.template_effect(($0, $1) => $.set_text(text_1, `${$0 ?? ''} - ${$1 ?? ''}`), [
																() => df.format($.get(date).start.toDate(getLocalTimeZone())),
																() => df.format($.get(date).end.toDate(getLocalTimeZone()))
															]);

															$.append($$anchor, text_1);
														};

														var alternate = ($$anchor) => {
															var text_2 = $.text('Pick a date');

															$.append($$anchor, text_2);
														};

														$.if(node_5, ($$render) => {
															if ($.get(date)?.start && $.get(date)?.end) $$render(consequent); else $$render(alternate, -1);
														});
													}

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											}));
										};

										$.component(node_3, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
											Popover_Trigger($$anchor, { child, $$slots: { child: true } });
										});
									}

									var node_6 = $.sibling(node_3, 2);

									$.component(node_6, () => Popover.Content, ($$anchor, Popover_Content) => {
										Popover_Content($$anchor, {
											class: 'w-auto p-0',
											align: 'start',
											children: ($$anchor, $$slotProps) => {
												RangeCalendar($$anchor, {
													numberOfMonths: 2,
													get value() {
														return $.get(date);
													},

													set value($$value) {
														$.set(date, $$value, true);
													}
												});
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}