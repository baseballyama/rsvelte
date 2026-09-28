import * as $ from 'svelte/internal/server';
import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
import { formatDateRange } from "little-date";
import * as Popover from "$lib/registry/ui/popover/index.js";
import RangeCalendar from "$lib/registry/ui/range-calendar/range-calendar.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Calendar_30($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = $.props_id($$renderer);

		let value = {
			start: new CalendarDate(2025, 6, 4),
			end: new CalendarDate(2025, 6, 10)
		};

		function formatRange(start, end) {
			return formatDateRange(start.toDate(getLocalTimeZone()), end.toDate(getLocalTimeZone()), { includeTime: false });
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex flex-col gap-3">`);

			Label($$renderer, {
				for: `${id}-dates`,
				class: 'px-1',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Select your stay`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (Popover.Root) {
				$$renderer.push('<!--[-->');

				Popover.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									props,
									{
										variant: 'outline',
										class: 'w-56 justify-between font-normal',
										children: ($$renderer) => {
											if (value?.start && value?.end) {
												$$renderer.push(`<!--[0-->${$.escape(formatRange(value.start, value.end))}`);
											} else {
												$$renderer.push(`<!--[-1-->Select date`);
											}

											$$renderer.push(`<!--]--> `);
											ChevronDownIcon($$renderer, {});
											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Popover.Trigger) {
								$$renderer.push('<!--[-->');
								Popover.Trigger($$renderer, { id: `${id}-dates`, child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Popover.Content) {
							$$renderer.push('<!--[-->');

							Popover.Content($$renderer, {
								class: 'w-auto overflow-hidden p-0',
								align: 'start',
								children: ($$renderer) => {
									RangeCalendar($$renderer, {
										captionLayout: 'dropdown',
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