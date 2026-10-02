import * as $ from 'svelte/internal/server';
import { Story, Template } from '@storybook/addon-svelte-csf';
import { PaginationItem, PaginationLink } from '@sveltestrap/sveltestrap';
import Pagination from './Pagination.svelte';

export const meta = {
	title: 'Stories/Pagination',
	component: Pagination,
	parameters: { controls: { exclude: /^(default)$/g } },
	argTypes: {
		ariaLabel: { control: 'text' },
		class: { className: 'string', table: { disable: true } },
		listClassName: { control: 'text' },
		size: { control: { type: 'select' }, options: ['', 'sm', 'lg'] },
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
		ariaLabel: 'Page navigation example',
		listClassName: '',
		size: '',
		theme: null
	}
};

export default function Pagination_stories($$renderer) {
	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				Pagination($$renderer, $.spread_props([
					args,
					{
						children: ($$renderer) => {
							PaginationItem($$renderer, {
								disabled: true,
								children: ($$renderer) => {
									PaginationLink($$renderer, { first: true, href: '#' });
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							PaginationItem($$renderer, {
								disabled: true,
								children: ($$renderer) => {
									PaginationLink($$renderer, { previous: true, href: '#' });
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							PaginationItem($$renderer, {
								active: true,
								children: ($$renderer) => {
									PaginationLink($$renderer, {
										href: '#',
										children: ($$renderer) => {
											$$renderer.push(`<!---->1`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							PaginationItem($$renderer, {
								children: ($$renderer) => {
									PaginationLink($$renderer, {
										href: '#',
										children: ($$renderer) => {
											$$renderer.push(`<!---->2`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							PaginationItem($$renderer, {
								children: ($$renderer) => {
									PaginationLink($$renderer, {
										href: '#',
										children: ($$renderer) => {
											$$renderer.push(`<!---->3`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							PaginationItem($$renderer, {
								children: ($$renderer) => {
									PaginationLink($$renderer, {
										href: '#',
										children: ($$renderer) => {
											$$renderer.push(`<!---->4`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							PaginationItem($$renderer, {
								children: ($$renderer) => {
									PaginationLink($$renderer, {
										href: '#',
										children: ($$renderer) => {
											$$renderer.push(`<!---->5`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							PaginationItem($$renderer, {
								children: ($$renderer) => {
									PaginationLink($$renderer, { next: true, href: '#' });
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!----> `);

							PaginationItem($$renderer, {
								children: ($$renderer) => {
									PaginationLink($$renderer, { last: true, href: '#' });
								},
								$$slots: { default: true }
							});

							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					}
				]));
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'Basic' });
	$$renderer.push(`<!----> `);

	Story($$renderer, {
		name: 'Sizes',
		children: ($$renderer) => {
			Pagination($$renderer, {
				size: 'lg',
				ariaLabel: 'Page navigation example',
				children: ($$renderer) => {
					PaginationItem($$renderer, {
						children: ($$renderer) => {
							PaginationLink($$renderer, { first: true, href: '#' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					PaginationItem($$renderer, {
						children: ($$renderer) => {
							PaginationLink($$renderer, { previous: true, href: '#' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					PaginationItem($$renderer, {
						children: ($$renderer) => {
							PaginationLink($$renderer, {
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->1`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					PaginationItem($$renderer, {
						active: true,
						children: ($$renderer) => {
							PaginationLink($$renderer, {
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->2`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					PaginationItem($$renderer, {
						children: ($$renderer) => {
							PaginationLink($$renderer, {
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->3`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					PaginationItem($$renderer, {
						children: ($$renderer) => {
							PaginationLink($$renderer, { next: true, href: '#' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					PaginationItem($$renderer, {
						children: ($$renderer) => {
							PaginationLink($$renderer, { last: true, href: '#' });
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
		name: 'Theming',
		children: ($$renderer) => {
			$$renderer.push(`<div class="vertical gap-xl">`);

			Pagination($$renderer, {
				theme: 'dark',
				ariaLabel: 'Dark page navigation example',
				children: ($$renderer) => {
					PaginationItem($$renderer, {
						children: ($$renderer) => {
							PaginationLink($$renderer, { first: true, href: '#' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					PaginationItem($$renderer, {
						children: ($$renderer) => {
							PaginationLink($$renderer, { previous: true, href: '#' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					PaginationItem($$renderer, {
						children: ($$renderer) => {
							PaginationLink($$renderer, {
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->1`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					PaginationItem($$renderer, {
						active: true,
						children: ($$renderer) => {
							PaginationLink($$renderer, {
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->2`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					PaginationItem($$renderer, {
						children: ($$renderer) => {
							PaginationLink($$renderer, {
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->3`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					PaginationItem($$renderer, {
						children: ($$renderer) => {
							PaginationLink($$renderer, { next: true, href: '#' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					PaginationItem($$renderer, {
						children: ($$renderer) => {
							PaginationLink($$renderer, { last: true, href: '#' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Pagination($$renderer, {
				theme: 'light',
				ariaLabel: 'Light page navigation example',
				children: ($$renderer) => {
					PaginationItem($$renderer, {
						children: ($$renderer) => {
							PaginationLink($$renderer, { first: true, href: '#' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					PaginationItem($$renderer, {
						children: ($$renderer) => {
							PaginationLink($$renderer, { previous: true, href: '#' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					PaginationItem($$renderer, {
						children: ($$renderer) => {
							PaginationLink($$renderer, {
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->1`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					PaginationItem($$renderer, {
						active: true,
						children: ($$renderer) => {
							PaginationLink($$renderer, {
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->2`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					PaginationItem($$renderer, {
						children: ($$renderer) => {
							PaginationLink($$renderer, {
								href: '#',
								children: ($$renderer) => {
									$$renderer.push(`<!---->3`);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					PaginationItem($$renderer, {
						children: ($$renderer) => {
							PaginationLink($$renderer, { next: true, href: '#' });
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					PaginationItem($$renderer, {
						children: ($$renderer) => {
							PaginationLink($$renderer, { last: true, href: '#' });
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

	$$renderer.push(`<!---->`);
}