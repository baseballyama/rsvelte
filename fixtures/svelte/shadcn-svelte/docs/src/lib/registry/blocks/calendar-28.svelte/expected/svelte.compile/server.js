import * as $ from 'svelte/internal/server';
import CalendarIcon from "@lucide/svelte/icons/calendar";
import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
import { untrack } from "svelte";
import * as Popover from "$lib/registry/ui/popover/index.js";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";
import { Button } from "$lib/registry/ui/button/index.js";
import { Input } from "$lib/registry/ui/input/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Calendar_28($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = $.props_id($$renderer);

		function formatDate(date) {
			if (!date) return "";

			return date.toDate(getLocalTimeZone()).toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" });
		}

		function isValidDate(date) {
			if (!date) return false;

			return !isNaN(date.getTime());
		}

		let value = new CalendarDate(2025, 6, 1);
		let open = false;
		let inputValue = untrack(() => formatDate(value));
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			var bind_get = () => inputValue;

			var bind_set = (v) => {
				const date = new Date(v);

				inputValue = v;

				if (isValidDate(date)) {
					value = new CalendarDate(date.getFullYear(), date.getMonth(), date.getDate());
				}
			};

			$$renderer.push(`<div class="flex flex-col gap-3">`);

			Label($$renderer, {
				for: `${id}-date`,
				class: 'px-1',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Subscription Date`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="relative flex gap-2">`);

			Input($$renderer, {
				id: `${id}-date`,
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
						open = true;
					}
				}
			});

			$$renderer.push(`<!----> `);

			if (Popover.Root) {
				$$renderer.push('<!--[-->');

				Popover.Root($$renderer, {
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									props,
									{
										variant: 'ghost',
										class: 'absolute end-2 top-1/2 size-6 -translate-y-1/2',
										children: ($$renderer) => {
											CalendarIcon($$renderer, { class: 'size-3.5' });
											$$renderer.push(`<!----> <span class="sr-only">Select date</span>`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Popover.Trigger) {
								$$renderer.push('<!--[-->');
								Popover.Trigger($$renderer, { id: `${id}-date-picker`, child, $$slots: { child: true } });
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
								align: 'end',
								alignOffset: -8,
								sideOffset: 10,
								children: ($$renderer) => {
									Calendar($$renderer, {
										type: 'single',
										captionLayout: 'dropdown',
										onValueChange: (v) => {
											inputValue = formatDate(v);
											open = false;
										},

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

			$$renderer.push(`</div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}