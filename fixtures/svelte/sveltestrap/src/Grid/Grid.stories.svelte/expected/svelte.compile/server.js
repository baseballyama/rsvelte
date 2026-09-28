import * as $ from 'svelte/internal/server';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { Col, Container, Row } from '@sveltestrap/sveltestrap';

export const meta = {
	title: 'Stories/Grid',
	parameters: {},
	argTypes: {
		class: { className: 'string', table: { disable: true } },
		sm: { control: 'boolean' },
		md: { control: 'boolean' },
		lg: { control: 'boolean' },
		xl: { control: 'boolean' },
		xxl: { control: 'boolean' },
		fluid: { control: 'boolean' }
	},
	args: {
		sm: true,
		md: true,
		lg: true,
		xl: true,
		xxl: true,
		fluid: true
	}
};

export default function Grid_stories($$renderer) {
	const cell = 'grid-cell';
	const row = 'grid-row';

	Story($$renderer, {
		name: 'Basic',
		children: ($$renderer) => {
			$$renderer.push(`<div class="grid-example">`);

			Container($$renderer, {
				fluid: true,
				children: ($$renderer) => {
					Row($$renderer, {
						noGutters: true,
						class: row,
						children: ($$renderer) => {
							Col($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col</div>`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Row($$renderer, {
						noGutters: true,
						class: row,
						children: ($$renderer) => {
							Col($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Col($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Col($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Col($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Row($$renderer, {
						noGutters: true,
						class: row,
						children: ($$renderer) => {
							Col($$renderer, {
								xs: '3',
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col-3</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Col($$renderer, {
								xs: 'auto',
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col-auto</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Col($$renderer, {
								xs: '3',
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col-3</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Row($$renderer, {
						noGutters: true,
						class: row,
						children: ($$renderer) => {
							Col($$renderer, {
								xs: '6',
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col-6</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Col($$renderer, {
								xs: '6',
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col-6</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Row($$renderer, {
						noGutters: true,
						class: row,
						children: ($$renderer) => {
							Col($$renderer, {
								xs: '6',
								sm: '4',
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col-6 col-sm-4</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Col($$renderer, {
								xs: '6',
								sm: '4',
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col-6 col-sm-4</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Col($$renderer, {
								sm: '4',
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col-sm-4</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Row($$renderer, {
						noGutters: true,
						class: row,
						children: ($$renderer) => {
							Col($$renderer, {
								sm: { size: 6, order: 2, offset: 1 },
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col-sm-6 order-sm-2 offset-sm-1</div>`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Row($$renderer, {
						noGutters: true,
						class: row,
						children: ($$renderer) => {
							Col($$renderer, {
								sm: '12',
								md: { size: 6, offset: 3 },
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col-sm-1 rounded2 col-md-6 offset-md-3</div>`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Row($$renderer, {
						noGutters: true,
						class: row,
						children: ($$renderer) => {
							Col($$renderer, {
								sm: { size: 'auto', offset: 1 },
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col-offset-sm-1</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Col($$renderer, {
								sm: { size: 'auto', offset: 1 },
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col-sm-auto offset-sm-1</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Row($$renderer, {
						cols: 2,
						class: row,
						children: ($$renderer) => {
							Col($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col-1</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Col($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col-2</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Col($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col-3</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Col($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col-4</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Col($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col-5</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Col($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col-6</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Row($$renderer, {
						cols: { lg: 3, md: 2, sm: 1 },
						class: row,
						children: ($$renderer) => {
							Col($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col-1</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Col($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col-2</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Col($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col-3</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Col($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col-4</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Col($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col-5</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							Col($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<div${$.attr_class($.clsx(cell))}>col-6</div>`);
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}