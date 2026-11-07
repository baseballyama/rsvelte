import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Field from "$lib/registry/ui/field/index.js";
import { Slider } from "$lib/registry/ui/slider/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Field_slider_fields($$anchor) {
	let brightness = $.state(75);
	let temperature = $.state($.proxy([0.3, 0.7]));
	let priceRange = $.state($.proxy([25, 75]));
	let colorBalance = $.state($.proxy([10, 20, 70]));

	Example($$anchor, {
		title: 'Slider Fields',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = $.comment();
			var node = $.first_child(fragment_1);

			$.component(node, () => Field.Group, ($$anchor, Field_Group) => {
				Field_Group($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_2();
						var node_1 = $.first_child(fragment_2);

						$.component(node_1, () => Field.Field, ($$anchor, Field_Field) => {
							Field_Field($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_3 = root();
									var node_2 = $.first_child(fragment_3);

									$.component(node_2, () => Field.Label, ($$anchor, Field_Label) => {
										Field_Label($$anchor, {
											for: 'slider-volume',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text('Volume');

												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});

									var node_3 = $.sibling(node_2, 2);

									Slider(node_3, {
										type: 'single',
										id: 'slider-volume',
										value: 50,
										max: 100,
										step: 1
									});

									$.append($$anchor, fragment_3);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_1, 2);

						$.component(node_4, () => Field.Field, ($$anchor, Field_Field_1) => {
							Field_Field_1($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_4 = root_1();
									var node_5 = $.first_child(fragment_4);

									$.component(node_5, () => Field.Label, ($$anchor, Field_Label_1) => {
										Field_Label_1($$anchor, {
											for: 'slider-brightness',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_1 = $.text('Screen Brightness');

												$.append($$anchor, text_1);
											},
											$$slots: { default: true }
										});
									});

									var node_6 = $.sibling(node_5, 2);

									Slider(node_6, {
										type: 'single',
										id: 'slider-brightness',
										max: 100,
										step: 5,
										get value() {
											return $.get(brightness);
										},

										set value($$value) {
											$.set(brightness, $$value, true);
										}
									});

									var node_7 = $.sibling(node_6, 2);

									$.component(node_7, () => Field.Description, ($$anchor, Field_Description) => {
										Field_Description($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_2 = $.text();

												$.template_effect(() => $.set_text(text_2, `Current brightness: ${$.get(brightness) ?? ''}%`));
												$.append($$anchor, text_2);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_4);
								},
								$$slots: { default: true }
							});
						});

						var node_8 = $.sibling(node_4, 2);

						$.component(node_8, () => Field.Field, ($$anchor, Field_Field_2) => {
							Field_Field_2($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_6 = root_1();
									var node_9 = $.first_child(fragment_6);

									$.component(node_9, () => Field.Label, ($$anchor, Field_Label_2) => {
										Field_Label_2($$anchor, {
											for: 'slider-quality',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_3 = $.text('Video Quality');

												$.append($$anchor, text_3);
											},
											$$slots: { default: true }
										});
									});

									var node_10 = $.sibling(node_9, 2);

									$.component(node_10, () => Field.Description, ($$anchor, Field_Description_1) => {
										Field_Description_1($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_4 = $.text('Higher quality uses more bandwidth.');

												$.append($$anchor, text_4);
											},
											$$slots: { default: true }
										});
									});

									var node_11 = $.sibling(node_10, 2);

									Slider(node_11, {
										type: 'single',
										id: 'slider-quality',
										value: 720,
										max: 1080,
										min: 360,
										step: 360
									});

									$.append($$anchor, fragment_6);
								},
								$$slots: { default: true }
							});
						});

						var node_12 = $.sibling(node_8, 2);

						$.component(node_12, () => Field.Field, ($$anchor, Field_Field_3) => {
							Field_Field_3($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_1();
									var node_13 = $.first_child(fragment_7);

									$.component(node_13, () => Field.Label, ($$anchor, Field_Label_3) => {
										Field_Label_3($$anchor, {
											for: 'slider-temperature',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_5 = $.text('Temperature Range');

												$.append($$anchor, text_5);
											},
											$$slots: { default: true }
										});
									});

									var node_14 = $.sibling(node_13, 2);

									Slider(node_14, {
										type: 'multiple',
										id: 'slider-temperature',
										min: 0,
										max: 1,
										step: 0.1,
										get value() {
											return $.get(temperature);
										},

										set value($$value) {
											$.set(temperature, $$value, true);
										}
									});

									var node_15 = $.sibling(node_14, 2);

									$.component(node_15, () => Field.Description, ($$anchor, Field_Description_2) => {
										Field_Description_2($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_6 = $.text();

												$.template_effect(($0, $1) => $.set_text(text_6, `Range: ${$0 ?? ''} - ${$1 ?? ''}`), [
													() => $.get(temperature)[0].toFixed(1),
													() => $.get(temperature)[1].toFixed(1)
												]);

												$.append($$anchor, text_6);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});
						});

						var node_16 = $.sibling(node_12, 2);

						$.component(node_16, () => Field.Field, ($$anchor, Field_Field_4) => {
							Field_Field_4($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_9 = root_1();
									var node_17 = $.first_child(fragment_9);

									$.component(node_17, () => Field.Label, ($$anchor, Field_Label_4) => {
										Field_Label_4($$anchor, {
											for: 'slider-price-range',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_7 = $.text('Price Range');

												$.append($$anchor, text_7);
											},
											$$slots: { default: true }
										});
									});

									var node_18 = $.sibling(node_17, 2);

									Slider(node_18, {
										type: 'multiple',
										id: 'slider-price-range',
										max: 100,
										step: 5,
										get value() {
											return $.get(priceRange);
										},

										set value($$value) {
											$.set(priceRange, $$value, true);
										}
									});

									var node_19 = $.sibling(node_18, 2);

									$.component(node_19, () => Field.Description, ($$anchor, Field_Description_3) => {
										Field_Description_3($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_8 = $.text();

												$.template_effect(() => $.set_text(text_8, `$${$.get(priceRange)[0] ?? ''} - $${$.get(priceRange)[1] ?? ''}`));
												$.append($$anchor, text_8);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_9);
								},
								$$slots: { default: true }
							});
						});

						var node_20 = $.sibling(node_16, 2);

						$.component(node_20, () => Field.Field, ($$anchor, Field_Field_5) => {
							Field_Field_5($$anchor, {
								children: ($$anchor, $$slotProps) => {
									var fragment_11 = root_1();
									var node_21 = $.first_child(fragment_11);

									$.component(node_21, () => Field.Label, ($$anchor, Field_Label_5) => {
										Field_Label_5($$anchor, {
											for: 'slider-color-balance',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_9 = $.text('Color Balance');

												$.append($$anchor, text_9);
											},
											$$slots: { default: true }
										});
									});

									var node_22 = $.sibling(node_21, 2);

									Slider(node_22, {
										type: 'multiple',
										id: 'slider-color-balance',
										max: 100,
										step: 10,
										get value() {
											return $.get(colorBalance);
										},

										set value($$value) {
											$.set(colorBalance, $$value, true);
										}
									});

									var node_23 = $.sibling(node_22, 2);

									$.component(node_23, () => Field.Description, ($$anchor, Field_Description_4) => {
										Field_Description_4($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_10 = $.text();

												$.template_effect(() => $.set_text(text_10, `Red: ${$.get(colorBalance)[0] ?? ''}%, Green: ${$.get(colorBalance)[1] ?? ''}%, Blue: ${$.get(colorBalance)[2] ?? ''}%`));
												$.append($$anchor, text_10);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_11);
								},
								$$slots: { default: true }
							});
						});

						var node_24 = $.sibling(node_20, 2);

						$.component(node_24, () => Field.Field, ($$anchor, Field_Field_6) => {
							Field_Field_6($$anchor, {
								'data-invalid': true,
								children: ($$anchor, $$slotProps) => {
									var fragment_13 = root_1();
									var node_25 = $.first_child(fragment_13);

									$.component(node_25, () => Field.Label, ($$anchor, Field_Label_6) => {
										Field_Label_6($$anchor, {
											for: 'slider-invalid',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_11 = $.text('Invalid Slider');

												$.append($$anchor, text_11);
											},
											$$slots: { default: true }
										});
									});

									var node_26 = $.sibling(node_25, 2);

									Slider(node_26, {
										type: 'single',
										id: 'slider-invalid',
										value: 40,
										max: 100,
										'aria-invalid': true
									});

									var node_27 = $.sibling(node_26, 2);

									$.component(node_27, () => Field.Description, ($$anchor, Field_Description_5) => {
										Field_Description_5($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_12 = $.text('This slider has validation errors.');

												$.append($$anchor, text_12);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_13);
								},
								$$slots: { default: true }
							});
						});

						var node_28 = $.sibling(node_24, 2);

						$.component(node_28, () => Field.Field, ($$anchor, Field_Field_7) => {
							Field_Field_7($$anchor, {
								'data-disabled': true,
								children: ($$anchor, $$slotProps) => {
									var fragment_14 = root_1();
									var node_29 = $.first_child(fragment_14);

									$.component(node_29, () => Field.Label, ($$anchor, Field_Label_7) => {
										Field_Label_7($$anchor, {
											for: 'slider-disabled-field',
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_13 = $.text('Disabled Slider');

												$.append($$anchor, text_13);
											},
											$$slots: { default: true }
										});
									});

									var node_30 = $.sibling(node_29, 2);

									Slider(node_30, {
										type: 'single',
										id: 'slider-disabled-field',
										value: 50,
										max: 100,
										disabled: true
									});

									var node_31 = $.sibling(node_30, 2);

									$.component(node_31, () => Field.Description, ($$anchor, Field_Description_6) => {
										Field_Description_6($$anchor, {
											children: ($$anchor, $$slotProps) => {
												$.next();

												var text_14 = $.text('This slider is currently disabled.');

												$.append($$anchor, text_14);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_14);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}