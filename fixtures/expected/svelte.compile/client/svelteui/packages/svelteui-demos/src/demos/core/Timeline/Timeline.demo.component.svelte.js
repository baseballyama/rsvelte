import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Center, Image, Text, ThemeIcon, Timeline } from '@svelteuidev/core';
import { Sun, LightningBolt } from 'radix-icons-svelte';

const code = `<script>
	import { Image, Text, ThemeIcon, Timeline } from '@svelteuidev/core';
  import { Sun, LightningBolt } from 'radix-icons-svelte';
<\/script>

<Timeline active={1} bulletSize={24} lineWidth={2}>
	<Timeline.Item title='Default bullet'>
		<Text color='dimmed' size='sm'>
			Default bullet with default styling
		</Text>
	</Timeline.Item>
	<Timeline.Item bullet={LightningBolt} title='Icon'>
		<Text color='dimmed' size='sm'>
			Item with bullet as icon
		</Text>
	</Timeline.Item>
	<Timeline.Item title='Icon'>
		<svelte:fragment slot='bullet'>
			<ThemeIcon radius='xl' color='orange'><Sun /></ThemeIcon>
		</svelte:fragment>
		<Text color='dimmed' size='sm'>
			Item with bullet as icon
		</Text>
	</Timeline.Item>
	<Timeline.Item title='Image'>
		<svelte:fragment slot='bullet'>
			<Image src="https://avatars.githubusercontent.com/u/1024025?v=4" />
		</svelte:fragment>
		<Text color='dimmed' size='sm'>
			Item with bullet as image
		</Text>
	</Timeline.Item>
</Timeline>`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Timeline_demo_component($$anchor) {
	Center($$anchor, {
		children: ($$anchor, $$slotProps) => {
			Timeline($$anchor, {
				active: 1,
				bulletSize: 24,
				lineWidth: 2,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					$.component(node, () => Timeline.Item, ($$anchor, Timeline_Item) => {
						Timeline_Item($$anchor, {
							title: 'Default bullet',
							children: ($$anchor, $$slotProps) => {
								Text($$anchor, {
									color: 'dimmed',
									size: 'sm',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text = $.text('Default bullet with default styling');

										$.append($$anchor, text);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					});

					var node_1 = $.sibling(node, 2);

					$.component(node_1, () => Timeline.Item, ($$anchor, Timeline_Item_1) => {
						Timeline_Item_1($$anchor, {
							get bullet() {
								return LightningBolt;
							},
							title: 'Icon',
							children: ($$anchor, $$slotProps) => {
								Text($$anchor, {
									color: 'dimmed',
									size: 'sm',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_1 = $.text('Item with bullet as icon');

										$.append($$anchor, text_1);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					});

					var node_2 = $.sibling(node_1, 2);

					$.component(node_2, () => Timeline.Item, ($$anchor, Timeline_Item_2) => {
						Timeline_Item_2($$anchor, {
							title: 'Icon',
							children: ($$anchor, $$slotProps) => {
								Text($$anchor, {
									color: 'dimmed',
									size: 'sm',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_2 = $.text('Item with bullet as icon');

										$.append($$anchor, text_2);
									},
									$$slots: { default: true }
								});
							},

							$$slots: {
								default: true,
								bullet: ($$anchor, $$slotProps) => {
									ThemeIcon($$anchor, {
										radius: 'xl',
										color: 'orange',
										children: ($$anchor, $$slotProps) => {
											Sun($$anchor, {});
										},
										$$slots: { default: true }
									});
								}
							}
						});
					});

					var node_3 = $.sibling(node_2, 2);

					$.component(node_3, () => Timeline.Item, ($$anchor, Timeline_Item_3) => {
						Timeline_Item_3($$anchor, {
							title: 'Image',
							children: ($$anchor, $$slotProps) => {
								Text($$anchor, {
									color: 'dimmed',
									size: 'sm',
									children: ($$anchor, $$slotProps) => {
										$.next();

										var text_3 = $.text('Item with bullet as image');

										$.append($$anchor, text_3);
									},
									$$slots: { default: true }
								});
							},

							$$slots: {
								default: true,
								bullet: ($$anchor, $$slotProps) => {
									Image($$anchor, { src: 'https://avatars.githubusercontent.com/u/1024025?v=4' });
								}
							}
						});
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}