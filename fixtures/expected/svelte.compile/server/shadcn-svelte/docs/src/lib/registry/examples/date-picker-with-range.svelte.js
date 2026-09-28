import * as $ from 'svelte/internal/server';
import CalendarIcon from "@lucide/svelte/icons/calendar";
import { CalendarDate, DateFormatter, getLocalTimeZone } from "@internationalized/date";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { RangeCalendar } from "$lib/registry/ui/range-calendar/index.js";
import { cn } from "$lib/utils.js";

export default function Date_picker_with_range($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const df = new DateFormatter("en-US", { dateStyle: "medium" });

		let value = {
			start: new CalendarDate(2022, 1, 20),
			end: new CalendarDate(2022, 1, 20).add({ days: 20 })
		};

		let startValue = undefined;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="grid gap-2">`);

			if (Popover.Root) {
				$$renderer.push('<!--[-->');

				Popover.Root($$renderer, {
					children: ($$renderer) => {
						if (Popover.Trigger) {
							$$renderer.push('<!--[-->');

							Popover.Trigger($$renderer, {
								class: cn(buttonVariants({ variant: "outline" }), !value && "text-muted-foreground"),
								children: ($$renderer) => {
									CalendarIcon($$renderer, { class: 'me-2 size-4' });
									$$renderer.push(`<!----> `);

									if (value && value.start) {
										$$renderer.push('<!--[0-->');

										if (value.end) {
											$$renderer.push(`<!--[0-->${$.escape(df.format(value.start.toDate(getLocalTimeZone())))} - ${$.escape(df.format(value.end.toDate(getLocalTimeZone())))}`);
										} else {
											$$renderer.push(`<!--[-1-->${$.escape(df.format(value.start.toDate(getLocalTimeZone())))}`);
										}

										$$renderer.push(`<!--]-->`);
									} else if (startValue) {
										$$renderer.push(`<!--[1-->${$.escape(df.format(startValue.toDate(getLocalTimeZone())))}`);
									} else {
										$$renderer.push(`<!--[-1-->Pick a date`);
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Popover.Content) {
							$$renderer.push('<!--[-->');

							Popover.Content($$renderer, {
								class: 'w-auto p-0',
								align: 'start',
								children: ($$renderer) => {
									RangeCalendar($$renderer, {
										onStartValueChange: (v) => {
											startValue = v;
										},
										numberOfMonths: 2,
										get value() {
											return value;
										},

										set value($$value) {
											value = $$value;
											$$settled = false;
										}
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}