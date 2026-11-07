import * as $ from 'svelte/internal/server';
import { Story, Template } from '@storybook/addon-svelte-csf';

import {
	Button,
	CardBody,
	CardFooter,
	CardHeader,
	CardSubtitle,
	CardText,
	CardTitle
} from '@sveltestrap/sveltestrap';

import Card from './Card.svelte';

export const meta = {
	title: 'Stories/Card',
	component: Card,
	parameters: { controls: { exclude: /^(click|default)$/g } },
	argTypes: {
		class: { className: 'string', table: { disable: true } },
		body: { control: 'boolean' },
		color: {
			control: { type: 'select' },
			options: [
				'primary',
				'secondary',
				'success',
				'danger',
				'warning',
				'info',
				'light',
				'dark'
			]
		},
		inverse: { control: 'boolean' },
		outline: { control: 'boolean' },
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
	args: {
		body: false,
		color: undefined,
		inverse: false,
		outline: false,
		theme: null
	}
};

export default function Card_stories($$renderer) {
	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				$$renderer.push(`<div class="card-example"><div class="card-width">`);

				Card($$renderer, $.spread_props([
					args,
					{
						children: ($$renderer) => {
							CardBody($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Hello World`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					}
				]));

				$$renderer.push(`<!----></div></div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Basic' });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Body',
		children: ($$renderer) => {
			$$renderer.push(`<div class="card-example"><div class="card-width">`);

			Card($$renderer, {
				body: true,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Goodbye Cruel World`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'HeaderFooter',
		children: ($$renderer) => {
			$$renderer.push(`<div class="card-example"><div class="card-width">`);

			Card($$renderer, {
				class: 'mb-3',
				children: ($$renderer) => {
					CardHeader($$renderer, {
						children: ($$renderer) => {
							CardTitle($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Card title`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					CardBody($$renderer, {
						children: ($$renderer) => {
							CardSubtitle($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Card subtitle`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							CardText($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Some quick example text to build on the card title and make up the bulk of the card's content.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Button`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					CardFooter($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Footer`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'ColorInverse',
		children: ($$renderer) => {
			$$renderer.push(`<div class="card-example"><div class="card-width">`);

			Card($$renderer, {
				body: true,
				color: 'primary',
				inverse: true,
				class: 'mb-3',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Primary`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Card($$renderer, {
				body: true,
				color: 'secondary',
				class: 'mb-3',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Secondary`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Card($$renderer, {
				body: true,
				color: 'success',
				class: 'mb-3',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Success`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Card($$renderer, {
				body: true,
				color: 'danger',
				class: 'mb-3',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Danger`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Card($$renderer, {
				body: true,
				color: 'warning',
				class: 'mb-3',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Warning`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Card($$renderer, {
				body: true,
				color: 'info',
				class: 'mb-3',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Info`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Card($$renderer, {
				body: true,
				color: 'dark',
				inverse: true,
				class: 'mb-3',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Dark`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Card($$renderer, {
				body: true,
				color: 'light',
				class: 'mb-3',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Light`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Theming',
		children: ($$renderer) => {
			$$renderer.push(`<div class="card-example vertical gap-lg"><div class="card-width">`);

			Card($$renderer, {
				theme: 'dark',
				class: 'mb-3',
				children: ($$renderer) => {
					CardHeader($$renderer, {
						children: ($$renderer) => {
							CardTitle($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Dark Theme`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					CardBody($$renderer, {
						children: ($$renderer) => {
							CardSubtitle($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Card subtitle`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							CardText($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Some quick example text to build on the card title and make up the bulk of the card's content.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Button`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					CardFooter($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Footer`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> <div class="card-width">`);

			Card($$renderer, {
				theme: 'light',
				children: ($$renderer) => {
					CardHeader($$renderer, {
						children: ($$renderer) => {
							CardTitle($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Light Theme`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					CardBody($$renderer, {
						children: ($$renderer) => {
							CardSubtitle($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Card subtitle`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							CardText($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Some quick example text to build on the card title and make up the bulk of the card's content.`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Button($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->Button`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					CardFooter($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Footer`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}