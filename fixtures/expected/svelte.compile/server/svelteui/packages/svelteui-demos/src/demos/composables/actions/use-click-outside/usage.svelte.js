import * as $ from 'svelte/internal/server';
import { Button, Center, Group, Paper, useSvelteUITheme } from '@svelteuidev/core';
import { clickoutside } from '@svelteuidev/composables';

const code = `
<script>
    import { Button, Paper } from '@svelteuidev/core';
    import { clickoutside } from '@svelteuidev/composables';

    let open = true;
<\/script>

<div use:clickoutside={{ enabled: open, callback: () => open = false }}>
    <Button on:click={() => open = true}>Open Modal</Button>
    {#if open}
        <Paper shadow='sm'>
            This is a modal, click anywhere to close
        </Paper>
    {/if}
</div>`;

export const type = 'demo';
export const configuration = { code };

export default function Usage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let open = false;
		let theme = useSvelteUITheme();

		Center($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div style="position: relative;">`);

				Group($$renderer, {
					position: 'center',
					children: ($$renderer) => {
						Button($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Open Modal`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				if (open) {
					$$renderer.push('<!--[0-->');

					Paper($$renderer, {
						shadow: 'sm',
						override: {
							zIndex: 1,
							width: 300,
							height: 60,
							position: 'absolute',
							top: 0,
							left: 'calc(50% - 150px)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: theme.colors.white.value,
							darkMode: { color: theme.fn.themeColor('dark', 6) }
						},

						children: ($$renderer) => {
							$$renderer.push(`<!---->This is a modal, click anywhere to close`);
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});
	});
}