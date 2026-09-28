import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
import { getLocalTimeZone } from "@internationalized/date";
import * as Popover from "$lib/registry/ui/popover/index.js";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col gap-6"><div class="flex gap-4"><div class="flex flex-1 flex-col gap-3"><!> <!></div> <div class="flex flex-col gap-3"><!> <!></div></div> <div class="flex gap-4"><div class="flex flex-1 flex-col gap-3"><!> <!></div> <div class="flex flex-col gap-3"><!> <!></div></div></div>`);

export default function Calendar_26($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	let openFrom = $.state(false);
	let openTo = $.state(false);
	let valueFrom = $.state(void 0);
	let valueTo = $.state(void 0);
	var div = root_2();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	Label(node, {
		get for() {
			return `${id}-date-from`;
		},
		class: 'px-1',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Check-in');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	$.component(node_1, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			get open() {
				return $.get(openFrom);
			},

			set open($$value) {
				$.set(openFrom, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_2 = $.first_child(fragment);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props(props, {
							variant: 'outline',
							class: 'w-full justify-between font-normal',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_2 = root();
								var text_1 = $.first_child(fragment_2);
								var node_3 = $.sibling(text_1);

								ChevronDownIcon(node_3, {});

								$.template_effect(($0) => $.set_text(text_1, `${$0 ?? ''} `), [
									() => $.get(valueFrom)
										? $.get(valueFrom).toDate(getLocalTimeZone()).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
										: "Select date"
								]);

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						}));
					};

					$.component(node_2, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, {
							get id() {
								return `${id}-date-from`;
							},
							child,
							$$slots: { child: true }
						});
					});
				}

				var node_4 = $.sibling(node_2, 2);

				$.component(node_4, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						class: 'w-auto overflow-hidden p-0',
						align: 'start',
						children: ($$anchor, $$slotProps) => {
							Calendar($$anchor, {
								type: 'single',
								captionLayout: 'dropdown',
								onValueChange: () => {
									$.set(openFrom, false);
								},

								get value() {
									return $.get(valueFrom);
								},

								set value($$value) {
									$.set(valueFrom, $$value, true);
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

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_5 = $.child(div_3);

	Label(node_5, {
		get for() {
			return `${id}-time-from`;
		},
		class: 'invisible px-1',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('From');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Input(node_6, {
		type: 'time',
		get id() {
			return `${id}-time-from`;
		},
		step: '1',
		value: '10:30:00',
		class: 'appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
	});

	$.reset(div_3);
	$.reset(div_1);

	var div_4 = $.sibling(div_1, 2);
	var div_5 = $.child(div_4);
	var node_7 = $.child(div_5);

	Label(node_7, {
		get for() {
			return `${id}-date-to`;
		},
		class: 'px-1',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Check-out');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_7, 2);

	$.component(node_8, () => Popover.Root, ($$anchor, Popover_Root_1) => {
		Popover_Root_1($$anchor, {
			get open() {
				return $.get(openTo);
			},

			set open($$value) {
				$.set(openTo, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_4 = root_1();
				var node_9 = $.first_child(fragment_4);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props(props, {
							variant: 'outline',
							class: 'w-full justify-between font-normal',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var fragment_6 = root();
								var text_4 = $.first_child(fragment_6);
								var node_10 = $.sibling(text_4);

								ChevronDownIcon(node_10, {});

								$.template_effect(($0) => $.set_text(text_4, `${$0 ?? ''} `), [
									() => $.get(valueTo)
										? $.get(valueTo).toDate(getLocalTimeZone()).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
										: "Select date"
								]);

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						}));
					};

					$.component(node_9, () => Popover.Trigger, ($$anchor, Popover_Trigger_1) => {
						Popover_Trigger_1($$anchor, {
							get id() {
								return `${id}-date-to`;
							},
							child,
							$$slots: { child: true }
						});
					});
				}

				var node_11 = $.sibling(node_9, 2);

				$.component(node_11, () => Popover.Content, ($$anchor, Popover_Content_1) => {
					Popover_Content_1($$anchor, {
						class: 'w-auto overflow-hidden p-0',
						align: 'start',
						children: ($$anchor, $$slotProps) => {
							Calendar($$anchor, {
								type: 'single',
								captionLayout: 'dropdown',
								onValueChange: () => {
									$.set(openTo, false);
								},

								isDateDisabled: (date) => {
									return ($.get(valueFrom) && date.compare($.get(valueFrom)) < 0) ?? false;
								},

								get value() {
									return $.get(valueTo);
								},

								set value($$value) {
									$.set(valueTo, $$value, true);
								}
							});
						},
						$$slots: { default: true }
					});
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_12 = $.child(div_6);

	Label(node_12, {
		get for() {
			return `${id}-time-to`;
		},
		class: 'invisible px-1',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('To');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_13 = $.sibling(node_12, 2);

	Input(node_13, {
		type: 'time',
		get id() {
			return `${id}-time-to`;
		},
		step: '1',
		value: '12:30:00',
		class: 'appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
	});

	$.reset(div_6);
	$.reset(div_4);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}