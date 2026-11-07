import * as $ from 'svelte/internal/server';
import { Box, Group, MediaQuery, useSvelteUITheme } from '@svelteuidev/core';

const code = `
<script>
	import { Box, Group, MediaQuery, useSvelteUITheme } from '@svelteuidev/core';

	const theme = useSvelteUITheme();

	const highlight = {
		backgroundColor: theme.colors.blue50.value,
		border: \`1px solid $\{theme.colors.blue300.value}\`
	};

	const boxStyles = {
		borderRadius: 3,
		padding: '3px 5px',
		border: '1px solid transparent'
	};
<\/script>

<Group direction="column" spacing={5}>
	<MediaQuery largerThan="lg" styles={highlight}>
		<Box css={boxStyles}>- larger than lg</Box>
	</MediaQuery>
	<MediaQuery smallerThan="lg" styles={highlight}>
		<Box css={boxStyles}>- Smaller than lg</Box>
	</MediaQuery>
	<MediaQuery smallerThan="xl" largerThan="sm" styles={highlight}>
		<Box css={boxStyles}>- Smaller than xl, larger than sm</Box>
	</MediaQuery>
	<MediaQuery smallerThan={1500} largerThan={800} styles={highlight}>
		<Box css={boxStyles}>- Smaller than 1500px, larger than 800px</Box>
	</MediaQuery>
</Group>
`;

export const type = 'demo';
export const configuration = { code };

export default function MediaQuery_demo_query($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const theme = useSvelteUITheme();

		const highlight = {
			backgroundColor: theme.colors.blue50.value,
			border: `1px solid ${theme.colors.blue300.value}`
		};

		const boxStyles = {
			borderRadius: 3,
			padding: '3px 5px',
			border: '1px solid transparent'
		};

		Group($$renderer, {
			direction: 'column',
			spacing: 5,
			children: ($$renderer) => {
				MediaQuery($$renderer, {
					largerThan: 'lg',
					styles: highlight,
					children: ($$renderer) => {
						Box($$renderer, {
							css: boxStyles,
							children: ($$renderer) => {
								$$renderer.push(`<!---->- larger than lg`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				MediaQuery($$renderer, {
					smallerThan: 'lg',
					styles: highlight,
					children: ($$renderer) => {
						Box($$renderer, {
							css: boxStyles,
							children: ($$renderer) => {
								$$renderer.push(`<!---->- Smaller than lg`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				MediaQuery($$renderer, {
					smallerThan: 'xl',
					largerThan: 'sm',
					styles: highlight,
					children: ($$renderer) => {
						Box($$renderer, {
							css: boxStyles,
							children: ($$renderer) => {
								$$renderer.push(`<!---->- Smaller than xl, larger than sm`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				MediaQuery($$renderer, {
					smallerThan: 1500,
					largerThan: 800,
					styles: highlight,
					children: ($$renderer) => {
						Box($$renderer, {
							css: boxStyles,
							children: ($$renderer) => {
								$$renderer.push(`<!---->- Smaller than 1500px, larger than 800px`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}