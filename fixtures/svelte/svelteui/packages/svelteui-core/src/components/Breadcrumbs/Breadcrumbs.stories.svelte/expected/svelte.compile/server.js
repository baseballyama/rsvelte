import * as $ from 'svelte/internal/server';
import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
import { Breadcrumbs } from './index';
import IconRenderer from '../IconRenderer/IconRenderer.svelte';
import { Home, Person } from 'radix-icons-svelte';

export default function Breadcrumbs_stories($$renderer) {
	Meta($$renderer, { title: 'Components/Breadcrumbs', component: Breadcrumbs });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Breadcrumbs($$renderer, $.spread_props([
					args,
					{
						size: 'md',
						children: ($$renderer) => {
							if (Breadcrumbs.Item) {
								$$renderer.push('<!--[-->');

								Breadcrumbs.Item($$renderer, {
									href: 'https://svelteui.dev',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Home`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Breadcrumbs.Item) {
								$$renderer.push('<!--[-->');

								Breadcrumbs.Item($$renderer, {
									active: true,
									children: ($$renderer) => {
										$$renderer.push(`<!---->Application List`);
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
					}
				]));
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Breadcrumbs', id: 'breadcrumbsStory' });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Icon',
		id: 'breadcrumbsIconStory',
		children: ($$renderer) => {
			Breadcrumbs($$renderer, {
				size: 'md',
				children: ($$renderer) => {
					if (Breadcrumbs.Item) {
						$$renderer.push('<!--[-->');

						Breadcrumbs.Item($$renderer, {
							href: 'https://svelteui.dev',
							$$slots: {
								icon: ($$renderer) => {
									IconRenderer($$renderer, { slot: 'icon', icon: Home });
								}
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Breadcrumbs.Item) {
						$$renderer.push('<!--[-->');

						Breadcrumbs.Item($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Application List`);
							},

							$$slots: {
								default: true,
								icon: ($$renderer) => {
									IconRenderer($$renderer, { slot: 'icon', icon: Person });
								}
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Breadcrumbs.Item) {
						$$renderer.push('<!--[-->');

						Breadcrumbs.Item($$renderer, {
							active: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->View`);
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
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Separator',
		id: 'breadcrumbsSeparatorStory',
		children: ($$renderer) => {
			Breadcrumbs($$renderer, {
				size: 'md',
				separator: '→',
				children: ($$renderer) => {
					if (Breadcrumbs.Item) {
						$$renderer.push('<!--[-->');

						Breadcrumbs.Item($$renderer, {
							href: 'https://svelteui.dev',
							$$slots: {
								icon: ($$renderer) => {
									IconRenderer($$renderer, { slot: 'icon', icon: Home });
								}
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Breadcrumbs.Item) {
						$$renderer.push('<!--[-->');

						Breadcrumbs.Item($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Application List`);
							},

							$$slots: {
								default: true,
								icon: ($$renderer) => {
									IconRenderer($$renderer, { slot: 'icon', icon: Person });
								}
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Breadcrumbs.Item) {
						$$renderer.push('<!--[-->');

						Breadcrumbs.Item($$renderer, {
							active: true,
							children: ($$renderer) => {
								$$renderer.push(`<!---->View`);
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
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}