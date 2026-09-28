import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
import { getLocalTimeZone, today } from "@internationalized/date";
import * as Popover from "$lib/registry/ui/popover/index.js";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

var root = $.from_html(` <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="flex flex-col gap-3"><!> <!></div>`);

export default function Calendar_22($$anchor, $$props) {
	const id = $.props_id();

	$.push($$props, true);

	let open = $.state(false);
	let value = $.state(void 0);
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

	$.component(node_1, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
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

								ChevronDownIcon(node_3, {});

								$.template_effect(($0) => $.set_text(text_1, `${$0 ?? ''} `), [
									() => $.get(value)
										? $.get(value).toDate(getLocalTimeZone()).toLocaleDateString()
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
								return `${id}-date`;
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
							{
								let $0 = $.derived(() => today(getLocalTimeZone()));

								Calendar($$anchor, {
									type: 'single',
									captionLayout: 'dropdown',
									onValueChange: () => {
										$.set(open, false);
									},

									get maxValue() {
										return $.get($0);
									},

									get value() {
										return $.get(value);
									},

									set value($$value) {
										$.set(value, $$value, true);
									}
								});
							}
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