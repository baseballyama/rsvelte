import * as $ from 'svelte/internal/server';
import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
import { useSvelteUITheme } from '$lib/styles';
import { Group } from '../Group';
import { Stack } from '../Stack';
import { Chip } from './index';

export default function Chip_stories($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const theme = useSvelteUITheme();
		const colors = Object.keys(theme.colorNames);

		Meta($$renderer, { title: 'Components/Chip', component: Chip });
		$$renderer.push(`<!----> `);

		Template($$renderer, {
			children: $.invalid_default_snippet,
			$$slots: {
				default: ($$renderer, { args }) => {
					Chip($$renderer, $.spread_props([args]));
				}
			}
		});

		$$renderer.push(`<!----> `);
		Story($$renderer, { name: 'Chip', args: { label: 'Chip' }, id: 'chipStory' });
		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'Colors',
			id: 'chipColorsStory',
			children: ($$renderer) => {
				Stack($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array = $.ensure_array_like(colors);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let color = each_array[$$index];

							Group($$renderer, {
								children: ($$renderer) => {
									Chip($$renderer, {
										color,
										variant: 'filled',
										checked: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Filled ${$.escape(color)} chip`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!----> `);

									Chip($$renderer, {
										color,
										variant: 'outline',
										checked: true,
										children: ($$renderer) => {
											$$renderer.push(`<!---->Outlined ${$.escape(color)} chip`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Story($$renderer, {
			name: 'States',
			id: 'chipStatesStory',
			children: ($$renderer) => {
				Group($$renderer, {
					children: ($$renderer) => {
						Chip($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Default chip`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Chip($$renderer, {
							variant: 'filled',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Filled chip`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Chip($$renderer, {
							variant: 'outline',
							checked: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Outline chip`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Chip($$renderer, {
							disabled: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Disabled chip`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Chip($$renderer, {
							checked: true,
							disabled: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Checked disabled chip`);
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
			name: 'Sizes',
			id: 'chipSizesStory',
			children: ($$renderer) => {
				Group($$renderer, {
					children: ($$renderer) => {
						Chip($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Default chip`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Chip($$renderer, {
							size: 'xs',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Extra small chip`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Chip($$renderer, {
							size: 'sm',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Small chip`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Chip($$renderer, {
							size: 'md',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Medium chip`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Chip($$renderer, {
							size: 'lg',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Large chip`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Chip($$renderer, {
							size: 'xl',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Extra large chip`);
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

		$$renderer.push(`<!---->`);
	});
}