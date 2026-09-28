import 'svelte/internal/disclose-version';
import Accordion from './Accordion.svelte';
import * as $ from 'svelte/internal/client';
import { Story } from '@storybook/addon-svelte-csf';
import { AccordionItem } from '@sveltestrap/sveltestrap';

export const meta = {
	title: 'Stories/Accordion',
	component: Accordion,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		class: { control: false, table: { disable: true } },
		flush: { control: 'boolean' },
		stayOpen: { control: 'boolean' },
		theme: {
			control: { type: 'select' },
			options: ['dark', 'light', 'auto'],
			description: 'The theme style to apply.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'auto' }
			}
		},
		'default ': {
			description: 'This is the default content slot.',
			table: {
				category: 'slots',
				type: { summary: 'any' },
				defaultValue: { summary: 'empty' }
			}
		}
	},
	args: { class: '', flush: false, stayOpen: false, theme: null }
};

var root = $.from_html(`<a href="#home">Buena Vista Elementary</a>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <br/> <code> </code>`, 1);
var root_3 = $.from_html(`<h4 class="m-0" slot="header">Home</h4>`);
var root_4 = $.from_html(`<h4 class="m-0" slot="header">School</h4>`);
var root_5 = $.from_html(`<h4 class="m-0" slot="header">Library</h4>`);
var root_6 = $.from_html(`<!> <!>`, 1);
var root_7 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Accordion_stories($$anchor) {
	let id = 1;
	let open = true;

	const basicSource = `<Accordion>
  <AccordionItem header="Home">Fallbrook</AccordionItem>
  <AccordionItem header="School">
    <a href="#home">Buena Vista Elementary</a>
  </AccordionItem>
  <AccordionItem header="Library">UCSB Library</AccordionItem>
</Accordion>`;

	var fragment = root_7();
	var node = $.first_child(fragment);

	Story(node, {
		name: 'Basic',
		source: basicSource,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				$.key(node_1, () => $.get(args), ($$anchor) => {
					Accordion($$anchor, $.spread_props(() => $.get(args), {
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_2 = $.first_child(fragment_3);

							AccordionItem(node_2, {
								header: 'Home',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('Fallbrook');

									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_3 = $.sibling(node_2, 2);

							AccordionItem(node_3, {
								header: 'School',
								children: ($$anchor, $$slotProps) => {
									var a = root();

									$.append($$anchor, a);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							AccordionItem(node_4, {
								header: 'Library',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_1 = $.text('UCSB Library');

									$.append($$anchor, text_1);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					}));
				});

				$.append($$anchor, fragment_1);
			}
		}
	});

	var node_5 = $.sibling(node, 2);

	Story(node_5, {
		name: 'Events',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_2();
			var node_6 = $.first_child(fragment_4);

			Accordion(node_6, {
				$$events: {
					toggle: function (...$$args) {
						console.log?.apply(this, $$args);
					}
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_5 = root_1();
					var node_7 = $.first_child(fragment_5);

					AccordionItem(node_7, {
						active: true,
						header: 'Home',
						$$events: {
							toggle: (e) => {
								id = 1;
								open = e.detail;
							}
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Fallbrook');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					AccordionItem(node_8, {
						header: 'School',
						$$events: {
							toggle: (e) => {
								id = 2;
								open = e.detail;
							}
						},

						children: ($$anchor, $$slotProps) => {
							var a_1 = root();

							$.append($$anchor, a_1);
						},
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);

					AccordionItem(node_9, {
						header: 'Library',
						$$events: {
							toggle: (e) => {
								id = 3;
								open = e.detail;
							}
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('UCSB Library');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_5);
				},
				$$slots: { default: true }
			});

			var code = $.sibling(node_6, 4);
			var text_4 = $.only_child(code);

			$.template_effect(() => $.set_text(text_4, `Item #${id ?? ''} is ${open ? 'open' : 'closed'}`));
			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_5, 2);

	Story(node_10, {
		name: 'Flush',
		children: ($$anchor, $$slotProps) => {
			Accordion($$anchor, {
				flush: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_7 = root_1();
					var node_11 = $.first_child(fragment_7);

					AccordionItem(node_11, {
						header: 'Home',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Fallbrook');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});

					var node_12 = $.sibling(node_11, 2);

					AccordionItem(node_12, {
						header: 'School',
						children: ($$anchor, $$slotProps) => {
							var a_2 = root();

							$.append($$anchor, a_2);
						},
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_12, 2);

					AccordionItem(node_13, {
						header: 'Library',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('UCSB Library');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_7);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_10, 2);

	Story(node_14, {
		name: 'Stay Open',
		children: ($$anchor, $$slotProps) => {
			Accordion($$anchor, {
				stayOpen: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_9 = root_1();
					var node_15 = $.first_child(fragment_9);

					AccordionItem(node_15, {
						header: 'Home',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Fallbrook');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_15, 2);

					AccordionItem(node_16, {
						header: 'School',
						children: ($$anchor, $$slotProps) => {
							var a_3 = root();

							$.append($$anchor, a_3);
						},
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_16, 2);

					AccordionItem(node_17, {
						header: 'Library',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('UCSB Library');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_9);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_14, 2);

	Story(node_18, {
		name: 'Slots',
		children: ($$anchor, $$slotProps) => {
			Accordion($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_11 = root_1();
					var node_19 = $.first_child(fragment_11);

					AccordionItem(node_19, {
						active: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('Fallbrook');

							$.append($$anchor, text_9);
						},

						$$slots: {
							default: true,
							header: ($$anchor, $$slotProps) => {
								var h4 = root_3();

								$.append($$anchor, h4);
							}
						}
					});

					var node_20 = $.sibling(node_19, 2);

					AccordionItem(node_20, {
						children: ($$anchor, $$slotProps) => {
							var a_4 = root();

							$.append($$anchor, a_4);
						},

						$$slots: {
							default: true,
							header: ($$anchor, $$slotProps) => {
								var h4_1 = root_4();

								$.append($$anchor, h4_1);
							}
						}
					});

					var node_21 = $.sibling(node_20, 2);

					AccordionItem(node_21, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text('UCSB Library');

							$.append($$anchor, text_10);
						},

						$$slots: {
							default: true,
							header: ($$anchor, $$slotProps) => {
								var h4_2 = root_5();

								$.append($$anchor, h4_2);
							}
						}
					});

					$.append($$anchor, fragment_11);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_22 = $.sibling(node_18, 2);

	Story(node_22, {
		name: 'Theming',
		children: ($$anchor, $$slotProps) => {
			var fragment_12 = root_6();
			var node_23 = $.first_child(fragment_12);

			Accordion(node_23, {
				theme: 'dark',
				class: 'mb-4',
				children: ($$anchor, $$slotProps) => {
					var fragment_13 = root_1();
					var node_24 = $.first_child(fragment_13);

					AccordionItem(node_24, {
						active: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_11 = $.text('Fallbrook');

							$.append($$anchor, text_11);
						},

						$$slots: {
							default: true,
							header: ($$anchor, $$slotProps) => {
								var h4_3 = root_3();

								$.append($$anchor, h4_3);
							}
						}
					});

					var node_25 = $.sibling(node_24, 2);

					AccordionItem(node_25, {
						children: ($$anchor, $$slotProps) => {
							var a_5 = root();

							$.append($$anchor, a_5);
						},

						$$slots: {
							default: true,
							header: ($$anchor, $$slotProps) => {
								var h4_4 = root_4();

								$.append($$anchor, h4_4);
							}
						}
					});

					var node_26 = $.sibling(node_25, 2);

					AccordionItem(node_26, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_12 = $.text('UCSB Library');

							$.append($$anchor, text_12);
						},

						$$slots: {
							default: true,
							header: ($$anchor, $$slotProps) => {
								var h4_5 = root_5();

								$.append($$anchor, h4_5);
							}
						}
					});

					$.append($$anchor, fragment_13);
				},
				$$slots: { default: true }
			});

			var node_27 = $.sibling(node_23, 2);

			Accordion(node_27, {
				theme: 'light',
				children: ($$anchor, $$slotProps) => {
					var fragment_14 = root_1();
					var node_28 = $.first_child(fragment_14);

					AccordionItem(node_28, {
						active: true,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_13 = $.text('Fallbrook');

							$.append($$anchor, text_13);
						},

						$$slots: {
							default: true,
							header: ($$anchor, $$slotProps) => {
								var h4_6 = root_3();

								$.append($$anchor, h4_6);
							}
						}
					});

					var node_29 = $.sibling(node_28, 2);

					AccordionItem(node_29, {
						children: ($$anchor, $$slotProps) => {
							var a_6 = root();

							$.append($$anchor, a_6);
						},

						$$slots: {
							default: true,
							header: ($$anchor, $$slotProps) => {
								var h4_7 = root_4();

								$.append($$anchor, h4_7);
							}
						}
					});

					var node_30 = $.sibling(node_29, 2);

					AccordionItem(node_30, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_14 = $.text('UCSB Library');

							$.append($$anchor, text_14);
						},

						$$slots: {
							default: true,
							header: ($$anchor, $$slotProps) => {
								var h4_8 = root_5();

								$.append($$anchor, h4_8);
							}
						}
					});

					$.append($$anchor, fragment_14);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_12);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}