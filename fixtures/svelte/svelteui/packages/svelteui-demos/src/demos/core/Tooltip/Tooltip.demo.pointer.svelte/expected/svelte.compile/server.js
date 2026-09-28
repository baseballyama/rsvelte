import * as $ from 'svelte/internal/server';
import { ActionIcon, Button, Center, Text, Tooltip } from '@svelteuidev/core';

const code = `
<script>
  import { Button, Tooltip } from '@svelteuidev/core';

  let opened = false;
<\/script>

<Tooltip
  opened={opened}
  allowPointerEvents
  withArrow
  wrapLines
  transition="rotate-left"
  transitionDuration={250}
  width={220}
  gutter={5}
>
  <div slot='label'>
    <Text size='xs'>
      Use this button to save this information in your profile, after that you will be able to access
      it any time and share it via email.
    </Text>
    <ActionIcon size='xs' on:click={() => (opened = false)}>
      x
    </ActionIcon>
  </div>
  <Button on:click={() => (opened = false)}>Save to profile</Button>
</Tooltip>

{#if !opened}
  <Button variant="light" color="gray" on:click={() => (opened = true)}>
    Reopen tooltip
  </Button>
{/if}
`;

export const type = 'demo';
export const configuration = { code };

export default function Tooltip_demo_pointer($$renderer) {
	let opened = true;

	Center($$renderer, {
		children: ($$renderer) => {
			Tooltip($$renderer, {
				opened,
				allowPointerEvents: true,
				withArrow: true,
				wrapLines: true,
				transitionDuration: 250,
				width: 220,
				gutter: 5,
				children: ($$renderer) => {
					Button($$renderer, {
						children: ($$renderer) => {
							$$renderer.push(`<!---->Save to profile`);
						},
						$$slots: { default: true }
					});
				},

				$$slots: {
					default: true,
					label: ($$renderer) => {
						$$renderer.push(`<div slot="label" style="display: flex;">`);

						Text($$renderer, {
							size: 'xs',
							color: 'white',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Use this button to save this information in your profile, after that you will be able to
				access it any time and share it via email.`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						ActionIcon($$renderer, {
							size: 'xs',
							color: 'white',
							children: ($$renderer) => {
								$$renderer.push(`<!---->x`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></div>`);
					}
				}
			});

			$$renderer.push(`<!----> `);

			if (!opened) {
				$$renderer.push('<!--[0-->');

				Button($$renderer, {
					variant: 'default',
					override: { marginLeft: '10px' },
					children: ($$renderer) => {
						$$renderer.push(`<!---->Reopen tooltip`);
					},
					$$slots: { default: true }
				});
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}