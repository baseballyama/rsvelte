import * as $ from 'svelte/internal/server';
import { Breadcrumbs, IconRenderer, Space } from '@svelteuidev/core';
import { Home, Person } from 'radix-icons-svelte';

const code = `
<script>
    import { Breadcrumbs, IconRenderer } from '@svelteuidev/core';
    import { Home, Person } from 'radix-icons-svelte';
<\/script>

<Breadcrumbs size="md">
  <Breadcrumbs.Item href="https://svelteui.dev">
    <IconRenderer slot="icon" icon={Home} />
  </Breadcrumbs.Item>
  <Breadcrumbs.Item>
    <IconRenderer slot="icon" icon={Person} />
    Application List
  </Breadcrumbs.Item>
  <Breadcrumbs.Item active={true}>View</Breadcrumbs.Item>
</Breadcrumbs>

<Breadcrumbs size="md" separator="→">
	<Breadcrumbs.Item href="https://svelteui.dev">Home</Breadcrumbs.Item>
	<Breadcrumbs.Item active={true}>Application List</Breadcrumbs.Item>
</Breadcrumbs>
	`;

export const type = 'demo';
export const configuration = { code };

export default function Breadcrumbs_demo_usage($$renderer) {
	Breadcrumbs($$renderer, {
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

	$$renderer.push(`<!----> `);
	Space($$renderer, { h: 10 });
	$$renderer.push(`<!----> `);

	Breadcrumbs($$renderer, {
		size: 'lg',
		separator: '→',
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
	});

	$$renderer.push(`<!---->`);
}