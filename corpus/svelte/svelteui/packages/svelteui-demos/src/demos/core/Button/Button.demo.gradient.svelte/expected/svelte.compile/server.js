import * as $ from 'svelte/internal/server';
import { Button, Group } from '@svelteuidev/core';

const code = `
<script>
	import { Button } from '@svelteuidev/core';
<\/script>

<Button variant='gradient'>Default</Button>
<Button variant='gradient' gradient={{from: 'teal', to: 'green', deg: 105}}>
	Lime Green
</Button>
<Button variant='gradient' gradient={{from: 'teal', to: 'blue', deg: 60}}>
	Teal Blue
</Button>
<Button variant='gradient' gradient={{from: 'orange', to: 'red', deg: 45}}>
	Orange red
</Button>
<Button variant='gradient' gradient={{from: 'grape', to: 'pink', deg: 35}}>
	Grape Pink
</Button>
`;

export const type = 'demo';
export const configuration = { code, toggle: false };

export default function Button_demo_gradient($$renderer) {
	Group($$renderer, {
		position: 'center',
		children: ($$renderer) => {
			Button($$renderer, {
				variant: 'gradient',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'gradient',
				gradient: { from: 'teal', to: 'green', deg: 105 },
				children: ($$renderer) => {
					$$renderer.push(`<!---->Lime Green`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'gradient',
				gradient: { from: 'teal', to: 'blue', deg: 60 },
				children: ($$renderer) => {
					$$renderer.push(`<!---->Teal Blue`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'gradient',
				gradient: { from: 'orange', to: 'red', deg: 45 },
				children: ($$renderer) => {
					$$renderer.push(`<!---->Orange red`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Button($$renderer, {
				variant: 'gradient',
				gradient: { from: 'grape', to: 'pink', deg: 35 },
				children: ($$renderer) => {
					$$renderer.push(`<!---->Grape Pink`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}