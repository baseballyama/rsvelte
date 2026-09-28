import * as $ from 'svelte/internal/server';
import { CalendarDate } from "@internationalized/date";
import * as Select from "$lib/registry/ui/select/index.js";
import Calendar from "$lib/registry/ui/calendar/calendar.svelte";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Calendar_13($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = $.props_id($$renderer);
		let value = new CalendarDate(2025, 6, 12);
		let dropdown = "dropdown";

		const dropdownOptions = [
			{ label: "Month and Year", value: "dropdown" },
			{ label: "Month Only", value: "dropdown-months" },
			{ label: "Year Only", value: "dropdown-years" }
		];

		const selectedDropdown = $.derived(() => dropdownOptions.find((option) => option.value === dropdown)?.label ?? "Dropdown");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="flex flex-col gap-4">`);

			Calendar($$renderer, {
				type: 'single',
				class: 'rounded-lg border shadow-sm',
				captionLayout: dropdown,
				get value() {
					return value;
				},

				set value($$value) {
					value = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="flex flex-col gap-3">`);

			Label($$renderer, {
				for: `${id}-dropdown`,
				class: 'px-1',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Dropdown`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (Select.Root) {
				$$renderer.push('<!--[-->');

				Select.Root($$renderer, {
					type: 'single',
					get value() {
						return dropdown;
					},

					set value($$value) {
						dropdown = $$value;
						$$settled = false;
					},

					children: ($$renderer) => {
						if (Select.Trigger) {
							$$renderer.push('<!--[-->');

							Select.Trigger($$renderer, {
								id: `${id}-dropdown`,
								size: 'sm',
								class: 'w-full bg-background',
								children: ($$renderer) => {
									$$renderer.push(`<!---->${$.escape(selectedDropdown())}`);
								},
								$$slots: { default: true }
							});

							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` `);

						if (Select.Content) {
							$$renderer.push('<!--[-->');

							Select.Content($$renderer, {
								align: 'center',
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array = $.ensure_array_like(dropdownOptions);

									for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
										let option = each_array[$$index];

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: option.value,
												children: ($$renderer) => {
													$$renderer.push(`<!---->${$.escape(option.label)}`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
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