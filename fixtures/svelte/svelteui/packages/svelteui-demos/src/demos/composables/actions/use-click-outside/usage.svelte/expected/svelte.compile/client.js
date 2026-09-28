import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<div style="position: relative;"><!> <!></div>`);

export default function Usage($$anchor, $$props) {
	$.push($$props, true);

	let open = false;
	let theme = useSvelteUITheme();

	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node = $.child(div);

			Group(node, {
				position: 'center',
				children: ($$anchor, $$slotProps) => {
					Button($$anchor, {
						$$events: { click: () => open = true },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Open Modal');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			{
				var consequent = ($$anchor) => {
					{
						let $0 = $.derived(() => ({
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
						}));

						Paper($$anchor, {
							shadow: 'sm',
							get override() {
								return $.get($0);
							},

							children: ($$anchor, $$slotProps) => {
								$.next();

								var text_1 = $.text('This is a modal, click anywhere to close');

								$.append($$anchor, text_1);
							},
							$$slots: { default: true }
						});
					}
				};

				$.if(node_1, ($$render) => {
					if (open) $$render(consequent);
				});
			}

			$.reset(div);
			$.action(div, ($$node, $$action_arg) => clickoutside?.($$node, $$action_arg), () => ({ enabled: open, callback: () => open = false }));
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.pop();
}