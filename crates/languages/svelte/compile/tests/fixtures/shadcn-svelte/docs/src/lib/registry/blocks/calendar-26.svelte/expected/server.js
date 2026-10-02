import * as $ from 'svelte/internal/server';
import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
import { getLocalTimeZone } from "@internationalized/date";
import * as Popover from "$lib/registry/ui/popover/index.js";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Calendar_26($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = $.props_id($$renderer);
		let openFrom = false;
		let openTo = false;
		let valueFrom = void 0;
		let valueTo = void 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex flex-col gap-6"><div class="flex gap-4"><div class="flex flex-1 flex-col gap-3">`);

			Label($$renderer, {
				for: `${id}-date-from`,
				class: 'px-1',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Check-in`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (Popover.Root) {
				$$renderer.push('<!--[-->');

				Popover.Root($$renderer, {
					get open() {
						return openFrom;
					},

					set open($$value) {
						openFrom = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									props,
									{
										variant: 'outline',
										class: 'w-full justify-between font-normal',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(valueFrom
												? valueFrom.toDate(getLocalTimeZone()).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
												: "Select date")} `);

											ChevronDownIcon($$renderer, {});
											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Popover.Trigger) {
								$$renderer.push('<!--[-->');
								Popover.Trigger($$renderer, { id: `${id}-date-from`, child, $$slots: { child: true } });
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
									Calendar($$renderer, {
										type: 'single',
										captionLayout: 'dropdown',
										onValueChange: () => {
											openFrom = false;
										},

										get value() {
											return valueFrom;
										},

										set value($$value) {
											valueFrom = $$value;
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

			$$renderer.push(`</div> <div class="flex flex-col gap-3">`);

			Label($$renderer, {
				for: `${id}-time-from`,
				class: 'invisible px-1',
				children: ($$renderer) => {
					$$renderer.push(`<!---->From`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				type: 'time',
				id: `${id}-time-from`,
				step: '1',
				value: '10:30:00',
				class: 'appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
			});

			$$renderer.push(`<!----></div></div> <div class="flex gap-4"><div class="flex flex-1 flex-col gap-3">`);

			Label($$renderer, {
				for: `${id}-date-to`,
				class: 'px-1',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Check-out`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (Popover.Root) {
				$$renderer.push('<!--[-->');

				Popover.Root($$renderer, {
					get open() {
						return openTo;
					},

					set open($$value) {
						openTo = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									props,
									{
										variant: 'outline',
										class: 'w-full justify-between font-normal',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(valueTo
												? valueTo.toDate(getLocalTimeZone()).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
												: "Select date")} `);

											ChevronDownIcon($$renderer, {});
											$$renderer.push(`<!---->`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Popover.Trigger) {
								$$renderer.push('<!--[-->');
								Popover.Trigger($$renderer, { id: `${id}-date-to`, child, $$slots: { child: true } });
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
									Calendar($$renderer, {
										type: 'single',
										captionLayout: 'dropdown',
										onValueChange: () => {
											openTo = false;
										},

										isDateDisabled: (date) => {
											return (valueFrom && date.compare(valueFrom) < 0) ?? false;
										},

										get value() {
											return valueTo;
										},

										set value($$value) {
											valueTo = $$value;
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

			$$renderer.push(`</div> <div class="flex flex-col gap-3">`);

			Label($$renderer, {
				for: `${id}-time-to`,
				class: 'invisible px-1',
				children: ($$renderer) => {
					$$renderer.push(`<!---->To`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Input($$renderer, {
				type: 'time',
				id: `${id}-time-to`,
				step: '1',
				value: '12:30:00',
				class: 'appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
			});

			$$renderer.push(`<!----></div></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}