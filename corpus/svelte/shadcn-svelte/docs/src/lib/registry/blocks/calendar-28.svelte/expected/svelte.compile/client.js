import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CalendarIcon from "@lucide/svelte/icons/calendar";
import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
import { untrack } from "svelte";
import * as Popover from "$lib/registry/ui/popover/index.js";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(`<!> <span class="sr-only">Select date</span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col gap-3"><!> <div class="relative flex gap-2"><!> <!></div></div>`);

export default function Calendar_28($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	function formatDate(date) {
		if (!date) return "";

		return date.toDate(getLocalTimeZone()).toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" });
	}

	function isValidDate(date) {
		if (!date) return false;

		return !isNaN(date.getTime());
	}

	let value = $.state($.proxy(new CalendarDate(2025, 6, 1)));
	let open = $.state(false);
	let inputValue = $.state($.proxy(untrack(() => formatDate($.get(value)))));
	var div = root_2();
	var node = $.child(div);

	Label(node, {
		get for() {
			return `${id}-date`;
		},
		class: 'px-1',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Subscription Date');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var node_1 = $.child(div_1);
	var bind_get = () => $.get(inputValue);

	var bind_set = (v) => {
		const date = new Date(v);

		$.set(inputValue, v, true);

		if (isValidDate(date)) {
			$.set(value, new CalendarDate(date.getFullYear(), date.getMonth(), date.getDate()), true);
		}
	};

	Input(node_1, {
		get id() {
			return `${id}-date`;
		},
		placeholder: 'June 01, 2025',
		class: 'bg-background pe-10',
		get value() {
			return bind_get();
		},

		set value($$value) {
			bind_set($$value);
		},

		onkeydown: (e) => {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				$.set(open, true);
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			get open() {
				return $.get(open);
			},

			set open($$value) {
				$.set(open, $$value, true);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment = root_1();
				var node_3 = $.first_child(fragment);

				{
					const child = ($$anchor, $$arg0) => {
						let props = () => ($$arg0?.()).props;

						Button($$anchor, $.spread_props(props, {
							variant: 'ghost',
							class: 'absolute end-2 top-1/2 size-6 -translate-y-1/2',
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root();
								var node_4 = $.first_child(fragment_2);

								CalendarIcon(node_4, { class: 'size-3.5' });
								$.next(2);
								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						}));
					};

					$.component(node_3, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, {
							get id() {
								return `${id}-date-picker`;
							},
							child,
							$$slots: { child: true }
						});
					});
				}

				var node_5 = $.sibling(node_3, 2);

				$.component(node_5, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						class: 'w-auto overflow-hidden p-0',
						align: 'end',
						alignOffset: -8,
						sideOffset: 10,
						children: ($$anchor, $$slotProps) => {
							Calendar($$anchor, {
								type: 'single',
								captionLayout: 'dropdown',
								onValueChange: (v) => {
									$.set(inputValue, formatDate(v), true);
									$.set(open, false);
								},

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

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}