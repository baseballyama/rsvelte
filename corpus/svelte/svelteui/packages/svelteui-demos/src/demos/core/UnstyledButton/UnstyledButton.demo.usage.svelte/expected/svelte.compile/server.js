import * as $ from 'svelte/internal/server';
import { Text, Group, UnstyledButton, ThemeIcon, Kbd } from '@svelteuidev/core';
import { useOs } from '@svelteuidev/composables';

const code = `
<script>
    import { UnstyledButton, ThemeIcon, Text, Group } from '@svelteuidev/core';
<\/script>

<Group position="center">
	<UnstyledButton aria-label="Open user menu" onClick={() => {}}>
		<Group>
			<ThemeIcon size={40} color="blue" variant="outline">BH</ThemeIcon>
			<div>
				<Text>Bob Handsome</Text>
				<Text size="xs" color="dimmed">bob@handsome.inc</Text>
			</div>
		</Group>
	</UnstyledButton>
</Group>
`;

export const type = 'demo';
export const configuration = { code };

export default function UnstyledButton_demo_usage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const os = useOs();
		const isDesktop = os === 'macos' || os === 'windows' || os === 'linux' ? true : false;

		Group($$renderer, {
			position: 'center',
			children: ($$renderer) => {
				UnstyledButton($$renderer, {
					'aria-label': 'Open user menu',
					children: ($$renderer) => {
						Group($$renderer, {
							children: ($$renderer) => {
								ThemeIcon($$renderer, {
									size: 40,
									color: 'blue',
									variant: 'outline',
									children: ($$renderer) => {
										$$renderer.push(`<!---->BH`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> <div>`);

								Text($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Bob Handsome`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Text($$renderer, {
									size: 'xs',
									color: 'dimmed',
									children: ($$renderer) => {
										$$renderer.push(`<!---->bob@handsome.inc`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----></div>`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (isDesktop) {
			$$renderer.push('<!--[0-->');

			Text($$renderer, {
				override: { mt: '$10' },
				align: 'center',
				weight: 'bold',
				tracking: 'tight',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Try clicking `);

					Kbd($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->tab`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> to focus the button!`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}