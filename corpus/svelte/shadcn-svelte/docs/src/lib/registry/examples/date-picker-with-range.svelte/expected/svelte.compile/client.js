import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CalendarIcon from "@lucide/svelte/icons/calendar";
import { CalendarDate, DateFormatter, getLocalTimeZone } from "@internationalized/date";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { RangeCalendar } from "$lib/registry/ui/range-calendar/index.js";
import { cn } from "$lib/utils.js";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid gap-2"><!></div>`);

export default function Date_picker_with_range($$anchor, $$props) {
	$.push($$props, true);

	const df = new DateFormatter("en-US", { dateStyle: "medium" });

	let value = $.state($.proxy({
		start: new CalendarDate(2022, 1, 20),
		end: new CalendarDate(2022, 1, 20).add({ days: 20 })
	}));

	let startValue = $.state(undefined);
	var div = root_1();
	var node = $.child(div);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				{
					let $0 = $.derived(() => cn(buttonVariants({ variant: "outline" }), !$.get(value) && "text-muted-foreground"));

					$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_1 = root();
								var node_2 = $.first_child(fragment_1);

								CalendarIcon(node_2, { class: 'me-2 size-4' });

								var node_3 = $.sibling(node_2, 2);

								{
									var consequent_1 = ($$anchor) => {
										var fragment_2 = $.comment();
										var node_4 = $.first_child(fragment_2);

										{
											var consequent = ($$anchor) => {
												var text = $.text();

												$.template_effect(($0, $1) => $.set_text(text, `${$0 ?? ''} - ${$1 ?? ''}`), [
													() => df.format($.get(value).start.toDate(getLocalTimeZone())),
													() => df.format($.get(value).end.toDate(getLocalTimeZone()))
												]);

												$.append($$anchor, text);
											};

											var alternate = ($$anchor) => {
												var text_1 = $.text();

												$.template_effect(($0) => $.set_text(text_1, $0), [
													() => df.format($.get(value).start.toDate(getLocalTimeZone()))
												]);

												$.append($$anchor, text_1);
											};

											$.if(node_4, ($$render) => {
												if ($.get(value).end) $$render(consequent); else $$render(alternate, -1);
											});
										}

										$.append($$anchor, fragment_2);
									};

									var consequent_2 = ($$anchor) => {
										var text_2 = $.text();

										$.template_effect(($0) => $.set_text(text_2, $0), [
											() => df.format($.get(startValue).toDate(getLocalTimeZone()))
										]);

										$.append($$anchor, text_2);
									};

									var alternate_1 = ($$anchor) => {
										var text_3 = $.text('Pick a date');

										$.append($$anchor, text_3);
									};

									$.if(node_3, ($$render) => {
										if ($.get(value) && $.get(value).start) $$render(consequent_1); else if ($.get(startValue)) $$render(consequent_2, 1); else $$render(alternate_1, -1);
									});
								}

								$.append($$anchor, fragment_1);
							},
							$$slots: { default: true }
						});
					});
				}

				var node_5 = $.sibling(node_1, 2);

				$.component(node_5, () => Popover.Content, ($$anchor, Popover_Content) => {
					Popover_Content($$anchor, {
						class: 'w-auto p-0',
						align: 'start',
						children: ($$anchor, $$slotProps) => {
							RangeCalendar($$anchor, {
								onStartValueChange: (v) => {
									$.set(startValue, v, true);
								},
								numberOfMonths: 2,
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

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}