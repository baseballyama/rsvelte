import * as $ from 'svelte/internal/server';
import { theme, Container } from '@svelteuidev/core';

const code = `
    <script>
        import { Container } from '@svelteuidev/core'
    <\/script>

    <Container override={{bc: 'AliceBlue'}}>
        Default container
    </Container>

    <Container size="xs" override={{px: 'xs', bc: 'AliceBlue'}}>
        xs container with xs horizontal padding
    </Container>

    <Container size={200} override={{px: 0, bc: 'AliceBlue'}}>
        200px container with 0px horizontal padding
    </Container>
    
	`;

export const type = 'demo';
export const configuration = { code };

export default function Container_demo_usage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const color = theme.colors['blue50'].value;

		Container($$renderer, {
			override: { backgroundColor: color, height: 50 },
			children: ($$renderer) => {
				$$renderer.push(`<!---->Default container`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Container($$renderer, {
			size: 'xs',
			override: { backgroundColor: color, height: 50, px: '$sm', mt: 20 },
			mt: 20,
			children: ($$renderer) => {
				$$renderer.push(`<!---->xs container with xs horizontal padding`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Container($$renderer, {
			size: 200,
			override: { backgroundColor: color, height: 50, px: 0, mt: 20 },
			children: ($$renderer) => {
				$$renderer.push(`<!---->200px container with 0px horizontal padding`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}