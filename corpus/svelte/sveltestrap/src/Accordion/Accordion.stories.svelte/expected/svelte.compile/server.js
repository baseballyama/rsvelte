import * as $ from 'svelte/internal/server';
import { Story } from '@storybook/addon-svelte-csf';
import { AccordionItem } from '@sveltestrap/sveltestrap';
import Accordion from './Accordion.svelte';

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

export default function Accordion_stories($$renderer) {
	let id = 1;
	let open = true;

	const basicSource = `<Accordion>
  <AccordionItem header="Home">Fallbrook</AccordionItem>
  <AccordionItem header="School">
    <a href="#home">Buena Vista Elementary</a>
  </AccordionItem>
  <AccordionItem header="Library">UCSB Library</AccordionItem>
</Accordion>`;

	Story($$renderer, {
		name: 'Basic',
		source: basicSource,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				$$renderer.push(`<!---->`);

				{
					Accordion($$renderer, $.spread_props([
						args,
						{
							children: ($$renderer) => {
								AccordionItem($$renderer, {
									header: 'Home',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Fallbrook`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								AccordionItem($$renderer, {
									header: 'School',
									children: ($$renderer) => {
										$$renderer.push(`<a href="#home">Buena Vista Elementary</a>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								AccordionItem($$renderer, {
									header: 'Library',
									children: ($$renderer) => {
										$$renderer.push(`<!---->UCSB Library`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						}
					]));
				}

				$$renderer.push(`<!---->`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Events',
		children: ($$renderer) => {
			Accordion($$renderer, {
				children: ($$renderer) => {
					AccordionItem($$renderer, {
						active: true,
						header: 'Home',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Fallbrook`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					AccordionItem($$renderer, {
						header: 'School',
						children: ($$renderer) => {
							$$renderer.push(`<a href="#home">Buena Vista Elementary</a>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					AccordionItem($$renderer, {
						header: 'Library',
						children: ($$renderer) => {
							$$renderer.push(`<!---->UCSB Library`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <br/> <code>Item #${$.escape(id)} is ${$.escape(open ? 'open' : 'closed')}</code>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Flush',
		children: ($$renderer) => {
			Accordion($$renderer, {
				flush: true,
				children: ($$renderer) => {
					AccordionItem($$renderer, {
						header: 'Home',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Fallbrook`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					AccordionItem($$renderer, {
						header: 'School',
						children: ($$renderer) => {
							$$renderer.push(`<a href="#home">Buena Vista Elementary</a>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					AccordionItem($$renderer, {
						header: 'Library',
						children: ($$renderer) => {
							$$renderer.push(`<!---->UCSB Library`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Stay Open',
		children: ($$renderer) => {
			Accordion($$renderer, {
				stayOpen: true,
				children: ($$renderer) => {
					AccordionItem($$renderer, {
						header: 'Home',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Fallbrook`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					AccordionItem($$renderer, {
						header: 'School',
						children: ($$renderer) => {
							$$renderer.push(`<a href="#home">Buena Vista Elementary</a>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					AccordionItem($$renderer, {
						header: 'Library',
						children: ($$renderer) => {
							$$renderer.push(`<!---->UCSB Library`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Slots',
		children: ($$renderer) => {
			Accordion($$renderer, {
				children: ($$renderer) => {
					AccordionItem($$renderer, {
						active: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Fallbrook`);
						},

						$$slots: {
							default: true,
							header: ($$renderer) => {
								$$renderer.push(`<h4 class="m-0" slot="header">Home</h4>`);
							}
						}
					});

					$$renderer.push(`<!----> `);

					AccordionItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<a href="#home">Buena Vista Elementary</a>`);
						},

						$$slots: {
							default: true,
							header: ($$renderer) => {
								$$renderer.push(`<h4 class="m-0" slot="header">School</h4>`);
							}
						}
					});

					$$renderer.push(`<!----> `);

					AccordionItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->UCSB Library`);
						},

						$$slots: {
							default: true,
							header: ($$renderer) => {
								$$renderer.push(`<h4 class="m-0" slot="header">Library</h4>`);
							}
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Theming',
		children: ($$renderer) => {
			Accordion($$renderer, {
				theme: 'dark',
				class: 'mb-4',
				children: ($$renderer) => {
					AccordionItem($$renderer, {
						active: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Fallbrook`);
						},

						$$slots: {
							default: true,
							header: ($$renderer) => {
								$$renderer.push(`<h4 class="m-0" slot="header">Home</h4>`);
							}
						}
					});

					$$renderer.push(`<!----> `);

					AccordionItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<a href="#home">Buena Vista Elementary</a>`);
						},

						$$slots: {
							default: true,
							header: ($$renderer) => {
								$$renderer.push(`<h4 class="m-0" slot="header">School</h4>`);
							}
						}
					});

					$$renderer.push(`<!----> `);

					AccordionItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->UCSB Library`);
						},

						$$slots: {
							default: true,
							header: ($$renderer) => {
								$$renderer.push(`<h4 class="m-0" slot="header">Library</h4>`);
							}
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Accordion($$renderer, {
				theme: 'light',
				children: ($$renderer) => {
					AccordionItem($$renderer, {
						active: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Fallbrook`);
						},

						$$slots: {
							default: true,
							header: ($$renderer) => {
								$$renderer.push(`<h4 class="m-0" slot="header">Home</h4>`);
							}
						}
					});

					$$renderer.push(`<!----> `);

					AccordionItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<a href="#home">Buena Vista Elementary</a>`);
						},

						$$slots: {
							default: true,
							header: ($$renderer) => {
								$$renderer.push(`<h4 class="m-0" slot="header">School</h4>`);
							}
						}
					});

					$$renderer.push(`<!----> `);

					AccordionItem($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->UCSB Library`);
						},

						$$slots: {
							default: true,
							header: ($$renderer) => {
								$$renderer.push(`<h4 class="m-0" slot="header">Library</h4>`);
							}
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}