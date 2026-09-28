import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div slot="label" style="display: flex;"><!> <!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Tooltip_demo_pointer($$anchor) {
	let opened = true;

	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Tooltip(node, {
				get opened() {
					return opened;
				},
				allowPointerEvents: true,
				withArrow: true,
				wrapLines: true,
				transitionDuration: 250,
				width: 220,
				gutter: 5,
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						$$events: { click: () => opened = false },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Save to profile');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				},

				$$slots: {
					default: true,
					label: ($$anchor, $$slotProps) => {
						var div = root();
						var node_1 = $.child(div);

						Text(node_1, {
							size: 'xs',
							color: 'white',
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('Use this button to save this information in your profile, after that you will be able to\n				access it any time and share it via email.');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});

						var node_2 = $.sibling(node_1, 2);

						ActionIcon(node_2, {
							size: 'xs',
							color: 'white',
							$$events: { click: () => opened = false },
							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_2 = $.text('x');

								$.append($$anchor, text_2);
							},
							$$slots: { default: true }
						});

						$.reset(div);
						$.append($$anchor, div);
					}
				}
			});

			var node_3 = $.sibling(node, 2);

			{
				var consequent = ($$anchor) => {
					Button($$anchor, {
						variant: 'default',
						override: { marginLeft: '10px' },
						$$events: { click: () => opened = true },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Reopen tooltip');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				};

				$.if(node_3, ($$render) => {
					if (!opened) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}