import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CalendarIcon from "@lucide/svelte/icons/calendar";
import { DateFormatter, getLocalTimeZone, today } from "@internationalized/date";
import * as Popover from "$lib/registry/ui/popover/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { Calendar } from "$lib/registry/ui/calendar/index.js";
import { cn } from "$lib/utils.js";

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <div class="rounded-md border"><!></div>`, 1);

export default function Date_picker_with_presets($$anchor, $$props) {
	$.push($$props, true);

	const df = new DateFormatter("en-US", { dateStyle: "long" });
	let value = $.state(void 0);

	const valueString = $.derived(() => $.get(value)
		? df.format($.get(value).toDate(getLocalTimeZone()))
		: "");

	const items = [
		{ value: 0, label: "Today" },
		{ value: 1, label: "Tomorrow" },
		{ value: 3, label: "In 3 days" },
		{ value: 7, label: "In a week" }
	];

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => cn(
						buttonVariants({
							variant: "outline",
							class: "w-[280px] justify-start text-start font-normal"
						}),
						!$.get(value) && "text-muted-foreground"
					));

					$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root();
								var node_2 = $.first_child(fragment_2);

								CalendarIcon(node_2, { class: 'me-2 size-4' });

								var text = $.sibling(node_2);

								$.template_effect(($0) => $.set_text(text, ` ${$0 ?? ''}`), [
									() => $.get(value)
										? df.format($.get(value).toDate(getLocalTimeZone()))
										: "Pick a date"
								]);

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_3 = $.sibling(node_1, 2);

				$.component(node_3, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						class: 'flex w-auto flex-col space-y-2 p-2',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_2();
							var node_4 = $.first_child(fragment_3);
							var bind_get = () => $.get(valueString);

							var bind_set = (v) => {
								if (!v) return;

								$.set(value, today(getLocalTimeZone()).add({ days: Number.parseInt(v) }), true);
							};

							$.component(node_4, () => Select.Root, ($$anchor, Select_Root) => {
								Select_Root($$anchor, {
									type: 'single',
									get value() {
										return bind_get();
									},

									set value($$value) {
										bind_set($$value);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_5 = $.first_child(fragment_4);

										$.component(node_5, () => Select.Trigger, ($$anchor, Select_Trigger) => {
											Select_Trigger($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_1 = $.text();

													$.template_effect(() => $.set_text(text_1, $.get(valueString)));
													$.append($$anchor, text_1);
												},
												$$slots: { default: true }
											});
										});

										var node_6 = $.sibling(node_5, 2);

										$.component(node_6, () => Select.Content, ($$anchor, Select_Content) => {
											Select_Content($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_6 = $.comment();
													var node_7 = $.first_child(fragment_6);

													$.each(node_7, 17, () => items, (item) => item.value, ($$anchor, item) => {
														var fragment_7 = $.comment();
														var node_8 = $.first_child(fragment_7);

														{
															let $0 = $.derived(() => `${$.get(item).value}`);

															$.component(node_8, () => Select.Item, ($$anchor, Select_Item) => {
																Select_Item($$anchor, {
																	get value() {
																		return $.get($0);
																	},

																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_2 = $.text();

																		$.template_effect(() => $.set_text(text_2, $.get(item).label));
																		$.append($$anchor, text_2);
																	},
																	$$slots: { default: true }
																});
															});
														}

														$.append($$anchor, fragment_7);
													});

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var div = $.sibling(node_4, 2);
							var node_9 = $.child(div);

							Calendar(node_9, {
								type: 'single',
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								}
							});

							$.reset(div);
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}