import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function MediaQuery_demo_query($$anchor, $$props) {
	$.push($$props, true);

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

	Group($$anchor, {
		direction: 'column',
		spacing: 5,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			MediaQuery(node, {
				largerThan: 'lg',
				get styles() {
					return highlight;
				},

				children: ($$anchor, $$slotProps) => {
					Box($$anchor, {
						get css() {
							return boxStyles;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('- larger than lg');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			MediaQuery(node_1, {
				smallerThan: 'lg',
				get styles() {
					return highlight;
				},

				children: ($$anchor, $$slotProps) => {
					Box($$anchor, {
						get css() {
							return boxStyles;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('- Smaller than lg');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			MediaQuery(node_2, {
				smallerThan: 'xl',
				largerThan: 'sm',
				get styles() {
					return highlight;
				},

				children: ($$anchor, $$slotProps) => {
					Box($$anchor, {
						get css() {
							return boxStyles;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('- Smaller than xl, larger than sm');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			MediaQuery(node_3, {
				smallerThan: 1500,
				largerThan: 800,
				get styles() {
					return highlight;
				},

				children: ($$anchor, $$slotProps) => {
					Box($$anchor, {
						get css() {
							return boxStyles;
						},

						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('- Smaller than 1500px, larger than 800px');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}