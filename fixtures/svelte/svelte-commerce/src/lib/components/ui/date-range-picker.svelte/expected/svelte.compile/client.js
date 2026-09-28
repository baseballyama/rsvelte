import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CalendarIcon } from '@lucide/svelte';
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date';
import { buttonVariants } from '$lib/components/ui/button';
import { RangeCalendar } from '$lib/components/ui/range-calendar';
import * as Popover from '$lib/components/ui/popover';
import { cn } from '$lib/core/utils';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="grid gap-2"><!></div>`);

export default function Date_range_picker($$anchor, $$props) {
	$.push($$props, true);

	let className = $.prop($$props, 'class', 3, ''),
		value = $.prop($$props, 'value', 15);

	const df = new DateFormatter('en-US', { dateStyle: 'medium' });

	// let value: DateRange = $state({
	// 	start: new CalendarDate(2022, 1, 20),
	// 	end: new CalendarDate(2022, 1, 20).add({ days: 20 })
	// })
	let startValue = $.state(undefined);

	let endValue = undefined;
	var div = root_1();
	var node = $.child(div);

	$.component(node, () => Popover.Root, ($$anchor, Popover_Root) => {
		Popover_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment = root();
				var node_1 = $.first_child(fragment);

				{
					let $0 = $.derived(() => cn(buttonVariants({ variant: 'outline' }), !value() && 'text-muted-foreground', className()));

					$.component(node_1, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
						Popover_Trigger($$anchor, {
							get class() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								var fragment_1 = root();
								var node_2 = $.first_child(fragment_1);

								CalendarIcon(node_2, { class: 'mr-2 size-4' });

								var node_3 = $.sibling(node_2, 2);

								{
									var consequent_1 = ($$anchor) => {
										var fragment_2 = $.comment();
										var node_4 = $.first_child(fragment_2);

										{
											var consequent = ($$anchor) => {
												var text = $.text();

												$.template_effect(($0, $1) => $.set_text(text, `${$0 ?? ''} - ${$1 ?? ''}`), [
													() => df.format(value().start?.toDate(getLocalTimeZone())),
													() => df.format(value().end?.toDate(getLocalTimeZone()))
												]);

												$.append($$anchor, text);
											};

											var alternate = ($$anchor) => {
												var text_1 = $.text();

												$.template_effect(($0) => $.set_text(text_1, $0), [() => df.format(value().start?.toDate(getLocalTimeZone()))]);
												$.append($$anchor, text_1);
											};

											$.if(node_4, ($$render) => {
												if (value().end) $$render(consequent); else $$render(alternate, -1);
											});
										}

										$.append($$anchor, fragment_2);
									};

									var consequent_2 = ($$anchor) => {
										var text_2 = $.text();

										$.template_effect(($0) => $.set_text(text_2, $0), [
											() => df.format($.get(startValue)?.toDate(getLocalTimeZone()))
										]);

										$.append($$anchor, text_2);
									};

									var alternate_1 = ($$anchor) => {
										var text_3 = $.text('Select Date Range');

										$.append($$anchor, text_3);
									};

									$.if(node_3, ($$render) => {
										if (value() && value().start) $$render(consequent_1); else if ($.get(startValue)) $$render(consequent_2, 1); else $$render(alternate_1, -1);
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
								onEndValueChange: (v) => {},
								numberOfMonths: 2,
								get value() {
									return value();
								},

								set value($$value) {
									value($$value);
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