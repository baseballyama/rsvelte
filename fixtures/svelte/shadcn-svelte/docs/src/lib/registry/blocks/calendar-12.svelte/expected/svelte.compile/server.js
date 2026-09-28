import * as $ from 'svelte/internal/server';
import { CalendarDate } from "@internationalized/date";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import RangeCalendar from "../ui/range-calendar/range-calendar.svelte";

export default function Calendar_12($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = {
			start: new CalendarDate(2025, 9, 9),
			end: new CalendarDate(2025, 9, 17)
		};

		const localizedStrings = {
			en: {
				title: "Book an appointment",
				description: "Select the dates for your appointment"
			},
			es: {
				title: "Reserva una cita",
				description: "Selecciona las fechas para tu cita"
			}
		};

		let locale = "es";

		const languageOptions = [
			{ label: "English", value: "en" },
			{ label: "Español", value: "es" }
		];

		const selectedLanguage = $.derived(() => languageOptions.find((option) => option.value === locale)?.label ?? "Language");
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (Card.Root) {
				$$renderer.push('<!--[-->');

				Card.Root($$renderer, {
					children: ($$renderer) => {
						if (Card.Header) {
							$$renderer.push('<!--[-->');

							Card.Header($$renderer, {
								children: ($$renderer) => {
									if (Card.Title) {
										$$renderer.push('<!--[-->');

										Card.Title($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(localizedStrings[locale].title)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Card.Description) {
										$$renderer.push('<!--[-->');

										Card.Description($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(localizedStrings[locale].description)}`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (Card.Action) {
										$$renderer.push('<!--[-->');

										Card.Action($$renderer, {
											children: ($$renderer) => {
												if (Select.Root) {
													$$renderer.push('<!--[-->');

													Select.Root($$renderer, {
														type: 'single',
														get value() {
															return locale;
														},

														set value($$value) {
															locale = $$value;
															$$settled = false;
														},

														children: ($$renderer) => {
															if (Select.Trigger) {
																$$renderer.push('<!--[-->');

																Select.Trigger($$renderer, {
																	class: 'w-[100px]',
																	'aria-label': 'Select language',
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(selectedLanguage())}`);
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
																	align: 'end',
																	children: ($$renderer) => {
																		$$renderer.push(`<!--[-->`);

																		const each_array = $.ensure_array_like(languageOptions);

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

						$$renderer.push(` `);

						if (Card.Content) {
							$$renderer.push('<!--[-->');

							Card.Content($$renderer, {
								children: ($$renderer) => {
									RangeCalendar($$renderer, {
										numberOfMonths: 2,
										locale,
										class: 'bg-transparent p-0',
										buttonVariant: 'outline',
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
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}