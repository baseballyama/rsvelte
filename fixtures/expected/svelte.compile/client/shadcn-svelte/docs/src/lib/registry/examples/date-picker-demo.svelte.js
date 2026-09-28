import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CalendarIcon from "@lucide/svelte/icons/calendar";
import { DateFormatter, getLocalTimeZone } from "@internationalized/date";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { Calendar } from "$lib/registry/ui/calendar/index.js";
import { cn } from "$lib/utils.js";

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Date_picker_demo($$anchor, $$props) {
	$.push($$props, true);

	const df = new DateFormatter("en-US", { dateStyle: "long" });
	let value = $.state(void 0);
	let contentRef = $.state(null);
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

								CalendarIcon(node_2, {});

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
						class: 'w-auto p-0',
						get ref() {
							return $.get(contentRef);
						},

						set ref($$value) {
							$.set(contentRef, $$value, true);
						},

						children: ($$anchor, $$slotProps) => {
							Calendar($$anchor, {
								type: 'single',
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

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}