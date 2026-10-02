import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { CalendarDate } from "@internationalized/date";
import * as Card from "$lib/registry/ui/card/index.js";
import * as Select from "$lib/registry/ui/select/index.js";
import RangeCalendar from "../ui/range-calendar/range-calendar.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Calendar_12($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state($.proxy({
		start: new CalendarDate(2025, 9, 9),
		end: new CalendarDate(2025, 9, 17)
	}));

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

	let locale = $.state("es");

	const languageOptions = [
		{ label: "English", value: "en" },
		{ label: "Español", value: "es" }
	];

	const selectedLanguage = $.derived(() => languageOptions.find((option) => option.value === $.get(locale))?.label ?? "Language");
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => Card.Root, ($$anchor, Card_Root) => {
		Card_Root($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root();
				var node_1 = $.first_child(fragment_1);

				$.component(node_1, () => Card.Header, ($$anchor, Card_Header) => {
					Card_Header($$anchor, {
						children: ($$anchor, $$slotProps) => {
							var fragment_2 = root_1();
							var node_2 = $.first_child(fragment_2);

							$.component(node_2, () => Card.Title, ($$anchor, Card_Title) => {
								Card_Title($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text();

										$.template_effect(() => $.set_text(text, localizedStrings[$.get(locale)].title));
										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							});

							var node_3 = $.sibling(node_2, 2);

							$.component(node_3, () => Card.Description, ($$anchor, Card_Description) => {
								Card_Description($$anchor, {
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, localizedStrings[$.get(locale)].description));
										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							});

							var node_4 = $.sibling(node_3, 2);

							$.component(node_4, () => Card.Action, ($$anchor, Card_Action) => {
								Card_Action($$anchor, {
									children: ($$anchor, $$slotProps) => {
										var fragment_5 = $.comment();
										var node_5 = $.first_child(fragment_5);

										$.component(node_5, () => Select.Root, ($$anchor, Select_Root) => {
											Select_Root($$anchor, {
												type: 'single',
												get value() {
													return $.get(locale);
												},

												set value($$value) {
													$.set(locale, $$value, true);
												},

												children: ($$anchor, $$slotProps) => {
													var fragment_6 = root();
													var node_6 = $.first_child(fragment_6);

													$.component(node_6, () => Select.Trigger, ($$anchor, Select_Trigger) => {
														Select_Trigger($$anchor, {
															class: 'w-[100px]',
															'aria-label': 'Select language',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_2 = $.text();

																$.template_effect(() => $.set_text(text_2, $.get(selectedLanguage)));
																$.append($$anchor, text_2);
															},
															$$slots: { default: true }
														});
													});

													var node_7 = $.sibling(node_6, 2);

													$.component(node_7, () => Select.Content, ($$anchor, Select_Content) => {
														Select_Content($$anchor, {
															align: 'end',
															children: ($$anchor, $$slotProps) => {
																var fragment_8 = $.comment();
																var node_8 = $.first_child(fragment_8);

																$.each(node_8, 17, () => languageOptions, (option) => option.value, ($$anchor, option) => {
																	var fragment_9 = $.comment();
																	var node_9 = $.first_child(fragment_9);

																	$.component(node_9, () => Select.Item, ($$anchor, Select_Item) => {
																		Select_Item($$anchor, {
																			get value() {
																				return $.get(option).value;
																			},

																			children: ($$anchor, $$slotProps) => {
																				$.next();

																				var text_3 = $.text();

																				$.template_effect(() => $.set_text(text_3, $.get(option).label));
																				$.append($$anchor, text_3);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_9);
																});

																$.append($$anchor, fragment_8);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_6);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_5);
									},
									$$slots: { default: true }
								});
							});

							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});

				var node_10 = $.sibling(node_1, 2);

				$.component(node_10, () => Card.Content, ($$anchor, Card_Content) => {
					Card_Content($$anchor, {
						children: ($$anchor, $$slotProps) => {
							RangeCalendar($$anchor, {
								numberOfMonths: 2,
								get locale() {
									return $.get(locale);
								},
								class: 'bg-transparent p-0',
								buttonVariant: 'outline',
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