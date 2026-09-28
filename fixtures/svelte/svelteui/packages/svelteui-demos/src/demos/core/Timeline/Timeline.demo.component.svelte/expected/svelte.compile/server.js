import * as $ from 'svelte/internal/server';
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

export default function Timeline_demo_component($$renderer) {
	Center($$renderer, {
		children: ($$renderer) => {
			Timeline($$renderer, {
				active: 1,
				bulletSize: 24,
				lineWidth: 2,
				children: ($$renderer) => {
					if (Timeline.Item) {
						$$renderer.push('<!--[-->');

						Timeline.Item($$renderer, {
							title: 'Default bullet',
							children: ($$renderer) => {
								Text($$renderer, {
									color: 'dimmed',
									size: 'sm',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Default bullet with default styling`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Timeline.Item) {
						$$renderer.push('<!--[-->');

						Timeline.Item($$renderer, {
							bullet: LightningBolt,
							title: 'Icon',
							children: ($$renderer) => {
								Text($$renderer, {
									color: 'dimmed',
									size: 'sm',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Item with bullet as icon`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Timeline.Item) {
						$$renderer.push('<!--[-->');

						Timeline.Item($$renderer, {
							title: 'Icon',
							children: ($$renderer) => {
								Text($$renderer, {
									color: 'dimmed',
									size: 'sm',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Item with bullet as icon`);
									},
									$$slots: { default: true }
								});
							},

							$$slots: {
								default: true,
								bullet: ($$renderer) => {
									{
										ThemeIcon($$renderer, {
											radius: 'xl',
											color: 'orange',
											children: ($$renderer) => {
												Sun($$renderer, {});
											},
											$$slots: { default: true }
										});
									}
								}
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}

					$$renderer.push(` `);

					if (Timeline.Item) {
						$$renderer.push('<!--[-->');

						Timeline.Item($$renderer, {
							title: 'Image',
							children: ($$renderer) => {
								Text($$renderer, {
									color: 'dimmed',
									size: 'sm',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Item with bullet as image`);
									},
									$$slots: { default: true }
								});
							},

							$$slots: {
								default: true,
								bullet: ($$renderer) => {
									{
										Image($$renderer, { src: 'https://avatars.githubusercontent.com/u/1024025?v=4' });
									}
								}
							}
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}