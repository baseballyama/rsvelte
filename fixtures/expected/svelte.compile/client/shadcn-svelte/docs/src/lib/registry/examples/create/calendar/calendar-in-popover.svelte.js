import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Popover from "$lib/registry/ui/popover/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Calendar } from "$lib/registry/ui/calendar/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> Open Calendar`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Calendar_in_popover($$anchor) {
	Example($$anchor, {
		title: 'In Popover',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
				Popover_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_1();
						var node_1 = $.first_child(fragment_2);

						{
							const child = ($$anchor, $$arg0) => {
								let props = () => ($$arg0?.()).props;

								Button($$anchor, $.spread_props(props, {
									variant: 'outline',
									class: 'px-2.5 font-normal',
									children: ($$anchor, $$slotProps) => {
										var fragment_4 = root();
										var node_2 = $.first_child(fragment_4);

										IconPlaceholder(node_2, {
											lucide: 'CalendarIcon',
											tabler: 'IconCalendar',
											hugeicons: 'CalendarIcon',
											phosphor: 'CalendarBlankIcon',
											remixicon: 'RiCalendarLine',
											'data-icon': 'inline-start'
										});

										$.next();
										$.append($$anchor, fragment_4);
									},
									$$slots: { default: true }
								}));
							};

							$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
								Popover_Trigger($$anchor, { child, $$slots: { child: true } });
							});
						}

						var node_3 = $.sibling(node_1, 2);

						$.component(node_3, () => Popover.Content, ($$anchor, Popover_Content) => {
							Popover_Content($$anchor, {
								class: 'w-auto p-0',
								align: 'start',
								children: ($$anchor, $$slotProps) => {
									Calendar($$anchor, { type: 'single' });
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
}