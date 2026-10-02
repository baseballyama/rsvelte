import * as $ from 'svelte/internal/server';
import CalendarIcon from "@lucide/svelte/icons/calendar";
import { DateFormatter, getLocalTimeZone, today } from "@internationalized/date";
import * as Popover from "$lib/registry/ui/popover/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import { buttonVariants } from "$lib/registry/ui/button/index.js";
import { Calendar } from "$lib/registry/ui/calendar/index.js";
import { cn } from "$lib/utils.js";

export default function Date_picker_with_presets($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const df = new DateFormatter("en-US", { dateStyle: "long" });
		let value = void 0;
		const valueString = $.derived(() => value ? df.format(value.toDate(getLocalTimeZone())) : "");

		const items = [
			{ value: 0, label: "Today" },
			{ value: 1, label: "Tomorrow" },
			{ value: 3, label: "In 3 days" },
			{ value: 7, label: "In a week" }
		];

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Popover.Root) {
				$$renderer.push('<!--[-->');

				Popover.Root($$renderer, {
					children: ($$renderer) => {
						if (Popover.Trigger) {
							$$renderer.push('<!--[-->');

							Popover.Trigger($$renderer, {
								class: cn(
									buttonVariants({
										variant: "outline",
										class: "w-[280px] justify-start text-start font-normal"
									}),
									!value && "text-muted-foreground"
								),

								children: ($$renderer) => {
									CalendarIcon($$renderer, { class: 'me-2 size-4' });

									$$renderer.push(`<!----> ${$.escape(value
										? df.format(value.toDate(getLocalTimeZone()))
										: "Pick a date")}`);
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
								class: 'flex w-auto flex-col space-y-2 p-2',
								children: ($$renderer) => {
									var bind_get = () => valueString();

									var bind_set = (v) => {
										if (!v) return;

										value = today(getLocalTimeZone()).add({ days: Number.parseInt(v) });
									};

									if (Select.Root) {
										$$renderer.push('<!--[-->');

										Select.Root($$renderer, {
											type: 'single',
											get value() {
												return bind_get();
											},

											set value($$value) {
												bind_set($$value);
											},

											children: ($$renderer) => {
												if (Select.Trigger) {
													$$renderer.push('<!--[-->');

													Select.Trigger($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->${$.escape(valueString())}`);
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
														children: ($$renderer) => {
															$$renderer.push(`<!--[-->`);

															const each_array = $.ensure_array_like(items);

															for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																let item = each_array[$$index];

																if (Select.Item) {
																	$$renderer.push('<!--[-->');

																	Select.Item($$renderer, {
																		value: `${item.value}`,
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(item.label)}`);
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

									$$renderer.push(` <div class="rounded-md border">`);

									Calendar($$renderer, {
										type: 'single',
										get value() {
											return value;
										},

										set value($$value) {
											value = $$value;
											$$settled = false;
										}
									});

									$$renderer.push(`<!----></div>`);
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}