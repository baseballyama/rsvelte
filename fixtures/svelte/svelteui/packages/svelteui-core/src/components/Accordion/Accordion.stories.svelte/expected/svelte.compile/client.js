import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { Accordion } from './index';

var root = $.from_html(`<div slot="control">Typescript Based</div>`);
var root_1 = $.from_html(`<div slot="control">Feature packed</div>`);
var root_2 = $.from_html(`<div slot="control">Accessible and usable</div>`);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<button>Pick random</button> <!>`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Accordion_stories($$anchor) {
	let value = 'typescript';
	var fragment = root_5();
	var node = $.first_child(fragment);

	Meta(node, {
		title: 'Components/Accordion',
		get component() {
			return Accordion;
		}
	});

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);

				Accordion($$anchor, $.spread_props(() => $.get(args), {
					defaultValue: 'typescript',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_3();
						var node_2 = $.first_child(fragment_2);

						$.component(node_2, () => Accordion.Item, ($$anchor, Accordion_Item) => {
							Accordion_Item($$anchor, {
								value: 'typescript',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Build type safe applications. All SvelteUI packages are built with TypeScript and support it by\n			default. All components and functions export types, are documented, and give developers autocomplete\n			features!');

									$.append($$anchor, text);
								},

								$$slots: {
									default: true,
									control: ($$anchor, $$slotProps) => {
										var div = root();

										$.append($$anchor, div);
									}
								}
							});
						});

						var node_3 = $.sibling(node_2, 2);

						$.component(node_3, () => Accordion.Item, ($$anchor, Accordion_Item_1) => {
							Accordion_Item_1($$anchor, {
								value: 'packed',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('SvelteUI contains more than just components. With Actions, Transitions, and Utilities available\n			to you, development will be fun and easy!');

									$.append($$anchor, text_1);
								},

								$$slots: {
									default: true,
									control: ($$anchor, $$slotProps) => {
										var div_1 = root_1();

										$.append($$anchor, div_1);
									}
								}
							});
						});

						var node_4 = $.sibling(node_3, 2);

						$.component(node_4, () => Accordion.Item, ($$anchor, Accordion_Item_2) => {
							Accordion_Item_2($$anchor, {
								value: 'accessible',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_2 = $.text('All components are accessible according to WAI-ARIA standards. On top of that, no annoying focus\n			ring. It will appear only when user navigates with keyboard.');

									$.append($$anchor, text_2);
								},

								$$slots: {
									default: true,
									control: ($$anchor, $$slotProps) => {
										var div_2 = root_2();

										$.append($$anchor, div_2);
									}
								}
							});
						});

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				}));
			}
		}
	});

	var node_5 = $.sibling(node_1, 2);

	Story(node_5, { name: 'Accordion', id: 'accordionStory' });

	var node_6 = $.sibling(node_5, 2);

	Story(node_6, {
		name: 'Multiple Tabs Open',
		id: 'accordionMultipleStory',
		args: { multiple: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Story(node_7, {
		name: 'Disabled Tabs',
		id: 'accordionDisabledStory',
		children: ($$anchor, $$slotProps) => {
			Accordion($$anchor, {
				defaultValue: 'typescript',
				children: ($$anchor, $$slotProps) => {
					var fragment_4 = root_3();
					var node_8 = $.first_child(fragment_4);

					$.component(node_8, () => Accordion.Item, ($$anchor, Accordion_Item_3) => {
						Accordion_Item_3($$anchor, {
							value: 'typescript',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_3 = $.text('Build type safe applications. All SvelteUI packages are built with TypeScript and support it by\n			default. All components and functions export types, are documented, and give developers autocomplete\n			features!');

								$.append($$anchor, text_3);
							},

							$$slots: {
								default: true,
								control: ($$anchor, $$slotProps) => {
									var div_3 = root();

									$.append($$anchor, div_3);
								}
							}
						});
					});

					var node_9 = $.sibling(node_8, 2);

					$.component(node_9, () => Accordion.Item, ($$anchor, Accordion_Item_4) => {
						Accordion_Item_4($$anchor, {
							value: 'packed',
							disabled: true,
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_4 = $.text('SvelteUI contains more than just components. With Actions, Transitions, and Utilities available\n			to you, development will be fun and easy!');

								$.append($$anchor, text_4);
							},

							$$slots: {
								default: true,
								control: ($$anchor, $$slotProps) => {
									var div_4 = root_1();

									$.append($$anchor, div_4);
								}
							}
						});
					});

					var node_10 = $.sibling(node_9, 2);

					$.component(node_10, () => Accordion.Item, ($$anchor, Accordion_Item_5) => {
						Accordion_Item_5($$anchor, {
							value: 'accessible',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_5 = $.text('All components are accessible according to WAI-ARIA standards. On top of that, no annoying focus\n			ring. It will appear only when user navigates with keyboard.');

								$.append($$anchor, text_5);
							},

							$$slots: {
								default: true,
								control: ($$anchor, $$slotProps) => {
									var div_5 = root_2();

									$.append($$anchor, div_5);
								}
							}
						});
					});

					$.append($$anchor, fragment_4);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_7, 2);

	Story(node_11, {
		name: 'Multiple Tabs Open With Default',
		id: 'accordionMultipleDefaultStory',
		children: ($$anchor, $$slotProps) => {
			Accordion($$anchor, {
				multiple: true,
				defaultValue: ['packed', 'accessible'],
				children: ($$anchor, $$slotProps) => {
					var fragment_6 = root_3();
					var node_12 = $.first_child(fragment_6);

					$.component(node_12, () => Accordion.Item, ($$anchor, Accordion_Item_6) => {
						Accordion_Item_6($$anchor, {
							value: 'typescript',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_6 = $.text('Build type safe applications. All SvelteUI packages are built with TypeScript and support it by\n			default. All components and functions export types, are documented, and give developers autocomplete\n			features!');

								$.append($$anchor, text_6);
							},

							$$slots: {
								default: true,
								control: ($$anchor, $$slotProps) => {
									var div_6 = root();

									$.append($$anchor, div_6);
								}
							}
						});
					});

					var node_13 = $.sibling(node_12, 2);

					$.component(node_13, () => Accordion.Item, ($$anchor, Accordion_Item_7) => {
						Accordion_Item_7($$anchor, {
							value: 'packed',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_7 = $.text('SvelteUI contains more than just components. With Actions, Transitions, and Utilities available\n			to you, development will be fun and easy!');

								$.append($$anchor, text_7);
							},

							$$slots: {
								default: true,
								control: ($$anchor, $$slotProps) => {
									var div_7 = root_1();

									$.append($$anchor, div_7);
								}
							}
						});
					});

					var node_14 = $.sibling(node_13, 2);

					$.component(node_14, () => Accordion.Item, ($$anchor, Accordion_Item_8) => {
						Accordion_Item_8($$anchor, {
							value: 'accessible',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_8 = $.text('All components are accessible according to WAI-ARIA standards. On top of that, no annoying focus\n			ring. It will appear only when user navigates with keyboard.');

								$.append($$anchor, text_8);
							},

							$$slots: {
								default: true,
								control: ($$anchor, $$slotProps) => {
									var div_8 = root_2();

									$.append($$anchor, div_8);
								}
							}
						});
					});

					$.append($$anchor, fragment_6);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_11, 2);

	Story(node_15, {
		name: 'Controlled',
		id: 'accordionControlledStory',
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root_4();
			var button = $.first_child(fragment_7);
			var text_9 = $.sibling(button);
			var node_16 = $.sibling(text_9);

			Accordion(node_16, {
				get value() {
					return value;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_8 = root_3();
					var node_17 = $.first_child(fragment_8);

					$.component(node_17, () => Accordion.Item, ($$anchor, Accordion_Item_9) => {
						Accordion_Item_9($$anchor, {
							value: 'typescript',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_10 = $.text('Build type safe applications. All SvelteUI packages are built with TypeScript and support it by\n			default. All components and functions export types, are documented, and give developers autocomplete\n			features!');

								$.append($$anchor, text_10);
							},

							$$slots: {
								default: true,
								control: ($$anchor, $$slotProps) => {
									var div_9 = root();

									$.append($$anchor, div_9);
								}
							}
						});
					});

					var node_18 = $.sibling(node_17, 2);

					$.component(node_18, () => Accordion.Item, ($$anchor, Accordion_Item_10) => {
						Accordion_Item_10($$anchor, {
							value: 'packed',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_11 = $.text('SvelteUI contains more than just components. With Actions, Transitions, and Utilities available\n			to you, development will be fun and easy!');

								$.append($$anchor, text_11);
							},

							$$slots: {
								default: true,
								control: ($$anchor, $$slotProps) => {
									var div_10 = root_1();

									$.append($$anchor, div_10);
								}
							}
						});
					});

					var node_19 = $.sibling(node_18, 2);

					$.component(node_19, () => Accordion.Item, ($$anchor, Accordion_Item_11) => {
						Accordion_Item_11($$anchor, {
							value: 'accessible',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_12 = $.text('All components are accessible according to WAI-ARIA standards. On top of that, no annoying focus\n			ring. It will appear only when user navigates with keyboard.');

								$.append($$anchor, text_12);
							},

							$$slots: {
								default: true,
								control: ($$anchor, $$slotProps) => {
									var div_11 = root_2();

									$.append($$anchor, div_11);
								}
							}
						});
					});

					$.append($$anchor, fragment_8);
				},
				$$slots: { default: true }
			});

			$.template_effect(() => $.set_text(text_9, ` ${value ?? ''} `));

			$.event('click', button, () => {
				const array = ['typescript', 'packed', 'accessible'];

				value = array[Math.floor(Math.random() * array.length)];
			});

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	var node_20 = $.sibling(node_15, 2);

	Story(node_20, {
		name: 'Transition Duration (1s)',
		id: 'accordionTransitionDurationLongStory',
		args: { transitionDuration: 1000 }
	});

	var node_21 = $.sibling(node_20, 2);

	Story(node_21, {
		name: 'Transition Duration (0s)',
		id: 'accordionNoTransitionDurationStory',
		args: { transitionDuration: 0 }
	});

	$.append($$anchor, fragment);
}