import * as $ from 'svelte/internal/server';
import { Chip, Group, Stack } from '@svelteuidev/core';

const code = `<script>
    import { Chip } from '@svelteuidev/core';
<\/script>

<Chip variant="outline">Outline default</Chip>
<Chip variant="outline" checked>Outline checked</Chip>
<Chip variant="outline" checked disabled>Outline checked disabled</Chip>
<Chip variant="filled">Filled default</Chip>
<Chip variant="filled" checked>Filled checked</Chip>
<Chip variant="filled" checked disabled>Filled checked disabled</Chip>`;

export const type = 'demo';
export const configuration = { code };

export default function Chip_demo_states($$renderer) {
	Stack($$renderer, {
		align: 'center',
		children: ($$renderer) => {
			Group($$renderer, {
				children: ($$renderer) => {
					Chip($$renderer, {
						variant: 'outline',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Outline default`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Chip($$renderer, {
						variant: 'outline',
						checked: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Outline checked`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Chip($$renderer, {
						variant: 'outline',
						checked: true,
						disabled: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Outline checked disabled`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Group($$renderer, {
				children: ($$renderer) => {
					Chip($$renderer, {
						variant: 'filled',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Filled default`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Chip($$renderer, {
						variant: 'filled',
						checked: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Filled checked`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Chip($$renderer, {
						variant: 'filled',
						checked: true,
						disabled: true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Filled checked disabled`);
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
}