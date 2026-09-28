import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CalendarPlusIcon from "@lucide/svelte/icons/calendar-plus";
import { getLocalTimeZone } from "@internationalized/date";
import * as Drawer from "$lib/registry/ui/drawer/index.js";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col gap-3"><!> <!> <div class="px-1 text-sm text-muted-foreground">This example works best on mobile.</div></div>`);

export default function Calendar_32($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	let open = $.state(false);
	let value = $.state(void 0);

	const triggerLabel = $.derived(() => {
		if ($.get(value)) return $.get(value).toDate(getLocalTimeZone()).toLocaleDateString();

		return "Select date";
	});

	var div = root_2();
	var node = $.child(div);

	Label(node, {
		get for() {
			return `${id}-date`;
		},
		class: 'px-1',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Date of birth');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => Drawer.Root, ($$anchor, Drawer_Root) => {
		Drawer_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_2 = $.first_child(fragment);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props(props, {
							variant: 'outline',
							class: 'w-48 justify-between font-normal',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_2 = root();
								var text_1 = $.first_child(fragment_2);
								var node_3 = $.sibling(text_1);

								CalendarPlusIcon(node_3, {});
								$.template_effect(() => $.set_text(text_1, `${$.get(triggerLabel) ?? ''} `));
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						}));
					};

					$.component(node_2, () => Drawer.Trigger, ($$anchor, Drawer_Trigger) => {
						Drawer_Trigger($$anchor, {
							get id() {
								return `${id}-date`;
							},
							child,
							$$slots: { child: true }
						});
					});
				}

				var node_4 = $.sibling(node_2, 2);

				$.component(node_4, () => Drawer.Content, ($$anchor, Drawer_Content) => {
					Drawer_Content($$anchor, {
						class: 'w-auto overflow-hidden p-0',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_5 = $.first_child(fragment_3);

							$.component(node_5, () => Drawer.Header, ($$anchor, Drawer_Header) => {
								Drawer_Header($$anchor, {
									class: 'sr-only',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root_1();
										var node_6 = $.first_child(fragment_4);

										$.component(node_6, () => Drawer.Title, ($$anchor, Drawer_Title) => {
											Drawer_Title($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_2 = $.text('Select date');

													$.append($$anchor, text_2);
												},
												$$slots: { default: true }
											});
										});

										var node_7 = $.sibling(node_6, 2);

										$.component(node_7, () => Drawer.Description, ($$anchor, Drawer_Description) => {
											Drawer_Description($$anchor, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('Set your date of birth');

													$.append($$anchor, text_3);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								});
							});

							var node_8 = $.sibling(node_5, 2);

							Calendar(node_8, {
								type: 'single',
								captionLayout: 'dropdown',
								onValueChange: (v) => {
									if (v) {
										$.set(open, false);
									}
								},
								class: 'mx-auto [--cell-size:clamp(0px,calc(100vw/7.5),52px)]',
								get value() {
									return $.get(value);
								},

								set value($$value) {
									$.set(value, $$value, true);
								}
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.next(2);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}