import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Calendar } from "$lib/registry/ui/calendar/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Date_picker_simple($$anchor, $$props) {
	$.push($$props, true);

	const df = new DateFormatter("en-US", { dateStyle: "long" });
	let date = $.state(void 0);

	Example($$anchor, {
		title: 'Date Picker Simple',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Field, ($$anchor, Field_Field) => {
				Field_Field($$anchor, {
					class: 'mx-auto w-72',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Label, ($$anchor, Field_Label) => {
							Field_Label($$anchor, {
								for: 'date-picker-simple',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Date');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});
						});

						var node_2 = $.sibling(node_1, 2);

						$.component(node_2, () => Popover.Root, ($$anchor, Popover_Root) => {
							Popover_Root($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_1();
									var node_3 = $.first_child(fragment_3);

									{
										const child = ($$anchor, $$arg0) => {
											let props = () => ($$arg0?.()).props;

											Button($$anchor, $.spread_props(props, {
												variant: 'outline',
												id: 'date-picker-simple',
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

													var text_1 = $.sibling(node_4);

													$.template_effect(($0) => $.set_text(text_1, ` ${$0 ?? ''}`), [
														() => $.get(date)
															? df.format($.get(date).toDate(getLocalTimeZone()))
															: "Pick a date"
													]);

													$.append($$anchor, fragment_5);
												},
												$$slots: { default: true }
											}));
										};

										$.component(node_3, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
											Popover_Trigger($$anchor, { child, $$slots: { child: true } });
										});
									}

									var node_5 = $.sibling(node_3, 2);

									$.component(node_5, () => Popover.Content, ($$anchor, Popover_Content) => {
										Popover_Content($$anchor, {
											class: 'w-auto p-0',
											align: 'start',
											children: ($$anchor, $$slotProps) => {
												Calendar($$anchor, {
													type: 'single',
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