import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`sRGBHex: <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Usage($$anchor, $$props) {
	$.push($$props, true);

	const $sRGBHex = () => $.store_get(sRGBHex, '$sRGBHex', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { isSupported, sRGBHex, open } = useEyeDropper({ initialValue: '#000000' });

	Center($$anchor, {
		css: { width: 400, m: 'auto' },
		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				align: 'center',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node = $.first_child(fragment_2);

					Text(node, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, `isSupported: ${isSupported ?? ''}`));
							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_1 = $.sibling(node, 2);

					Text(node_1, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var fragment_4 = root();
							var node_2 = $.sibling($.first_child(fragment_4));

							{
								let $0 = $.derived(() => ({ color: `${$sRGBHex()} !important` }));

								Text(node_2, {
									inherit: true,
									get override() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text();

										$.template_effect(() => $.set_text(text_1, $sRGBHex()));
										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							}

							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_1, 2);

					Button(node_3, {
						variant: 'outline',
						$$events: { click: () => open() },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Open Eye Dropper');

							$.append($$anchor, text_2);
						},

						$$slots: {
							default: true,
							leftIcon: ($$anchor, $$slotProps) => {
								EyeOpen($$anchor, { slot: 'leftIcon' });
							}
						}
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.pop();
	$$cleanup();
}