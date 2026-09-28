import * as $ from 'svelte/internal/server';
import { Center, Stack, Text, Button } from '@svelteuidev/core';
import { useEyeDropper } from '@svelteuidev/composables';
import { EyeOpen } from 'radix-icons-svelte';

const code = `
<script>
	import { Center, Stack, Text, Button } from '@svelteuidev/core';
	import { useEyeDropper } from '@svelteuidev/composables';
	import { EyeOpen } from 'radix-icons-svelte';

	const { isSupported, sRGBHex, open } = useEyeDropper({ initialValue: '#000000' });
<\/script>

<Center css={{ width: 400, m: 'auto' }}>
	<Stack align="center">
		<Text>isSupported: {isSupported}</Text>
		<Text>
			sRGBHex: <Text inherit override={{ color: \`$\{$sRGBHex} !important\` }}>{$sRGBHex}</Text>
		</Text>
		<Button variant="outline" on:click={() => open()}>
			<EyeOpen slot="leftIcon" />
			Open Eye Dropper
		</Button>
	</Stack>
</Center>
`;

export const type = 'demo';
export const configuration = { code };

export default function Usage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { isSupported, sRGBHex, open } = useEyeDropper({ initialValue: '#000000' });

		Center($$renderer, {
			css: { width: 400, m: 'auto' },
			children: ($$renderer) => {
				Stack($$renderer, {
					align: 'center',
					children: ($$renderer) => {
						Text($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->isSupported: ${$.escape(isSupported)}`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Text($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->sRGBHex: `);

								Text($$renderer, {
									inherit: true,
									override: {
										color: `${$.store_get($$store_subs ??= {}, '$sRGBHex', sRGBHex)} !important`
									},

									children: ($$renderer) => {
										$$renderer.push(`<!---->${$.escape($.store_get($$store_subs ??= {}, '$sRGBHex', sRGBHex))}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Button($$renderer, {
							variant: 'outline',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Open Eye Dropper`);
							},

							$$slots: {
								default: true,
								leftIcon: ($$renderer) => {
									EyeOpen($$renderer, { slot: 'leftIcon' });
								}
							}
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}