import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
import * as Field from "$lib/registry/ui/field/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Calendar } from "$lib/registry/ui/calendar/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<!> <div class="flex gap-2 border-t p-2"><!></div>`, 1);
var root_2 = $.from_html(`<!> <!> <!>`, 1);

export default function Date_picker_with_dropdowns($$anchor, $$props) {
	$.push($$props, true);

	const df = new DateFormatter("en-US", { dateStyle: "long" });
	let date = $.state(void 0);
	let open = $.state(false);

	Example($$anchor, {
		title: 'Date Picker with Dropdowns',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Field, ($$anchor, Field_Field) => {
				Field_Field($$anchor, {
					class: 'mx-auto w-72',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = $.comment();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Popover.Root, ($$anchor, Popover_Root) => {
							Popover_Root($$anchor, {
								get open() {
									return $.get(open);
								},

								set open($$value) {
									$.set(open, $$value, true);
								},

								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root_2();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Field.Label, ($$anchor, Field_Label) => {
										Field_Label($$anchor, {
											for: 'date-picker-with-dropdowns-desktop',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Date');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									{
										const child = ($$anchor, $$arg0) => {
											let props = () => ($$arg0?.()).props;

											Button($$anchor, $.spread_props(props, {
												variant: 'outline',
												id: 'date-picker-with-dropdowns-desktop',
												class: 'justify-start px-2.5 font-normal',
												children: ($$anchor, $$slotProps) => {
													$.next();

													var fragment_5 = root();
													var text_1 = $.first_child(fragment_5);
													var node_4 = $.sibling(text_1);

													IconPlaceholder(node_4, {
														lucide: 'ChevronDownIcon',
														tabler: 'IconChevronDown',
														hugeicons: 'ArrowDownIcon',
														phosphor: 'CaretDownIcon',
														remixicon: 'RiArrowDownSLine',
														'data-icon': 'inline-start',
														class: 'ml-auto'
													});

													$.template_effect(($0) => $.set_text(text_1, `${$0 ?? ''} `), [
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
												var fragment_6 = root_1();
												var node_6 = $.first_child(fragment_6);

												Calendar(node_6, {
													type: 'single',
													captionLayout: 'dropdown',
													get value() {
														return $.get(date);
													},

													set value($$value) {
														$.set(date, $$value, true);
													}
												});

												var div = $.sibling(node_6, 2);
												var node_7 = $.child(div);

												Button(node_7, {
													variant: 'outline',
													size: 'sm',
													class: 'w-full',
													onclick: () => $.set(open, false),
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_2 = $.text('Done');

														$.append($$anchor, text_2);
													},
													$$slots: { default: true }
												});

												$.reset(div);
												$.append($$anchor, fragment_6);
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