import * as $ from 'svelte/internal/server';

import {
	Badge,
	Button,
	Card,
	Group,
	Image,
	Text,
	colorScheme,
	useSvelteUITheme
} from '@svelteuidev/core';

const code = `
<script>
	import { Badge, Button, Card, Group, Image, Text } from '@svelteuidev/core';
<\/script>

<Card shadow='sm' padding='lg'>
	<Card.Section first padding='lg'>
		<Image
			src='./image.png'
			height={160}
			alt='Portugal'
		/>
	</Card.Section>

	<Group position='apart'>
		<Text weight={500}>Portugal Porto Adventures</Text>
		<Badge color='pink' variant='light'>
			On Sale
		</Badge>
	</Group>

	<Text size='sm'>
		With Portugal Porto Adventures you can explore more of the beautiful portuguese cities,
		by walking on food, meeting the locals and eat excellent food and wine
	</Text>

	<Button variant='light' color='blue' fullSize>
		Book classic tour now
	</Button>
</Card>`;

export const type = 'demo';
export const configuration = { code };

export default function Card_demo_usage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const { themeColor } = useSvelteUITheme().fn;
		const secondaryColor = $.store_get($$store_subs ??= {}, '$colorScheme', colorScheme) === 'dark' ? themeColor('dark', 1) : themeColor('dark', 7);

		$$renderer.push(`<div style="width: 340px; margin: auto">`);

		Card($$renderer, {
			shadow: 'sm',
			padding: 'lg',
			children: ($$renderer) => {
				if (Card.Section) {
					$$renderer.push('<!--[-->');

					Card.Section($$renderer, {
						first: true,
						padding: 'lg',
						children: ($$renderer) => {
							Image($$renderer, {
								src: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3540&q=80',
								height: 160,
								alt: 'Portugal'
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

				Group($$renderer, {
					position: 'apart',
					override: { marginBottom: '5px', marginTop: '$smPX' },
					children: ($$renderer) => {
						Text($$renderer, {
							weight: 500,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Portugal Porto Adventures`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> `);

						Badge($$renderer, {
							color: 'pink',
							variant: 'light',
							children: ($$renderer) => {
								$$renderer.push(`<!---->On Sale`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Text($$renderer, {
					size: 'sm',
					override: { color: secondaryColor, lineHeight: 1.5 },
					children: ($$renderer) => {
						$$renderer.push(`<!---->With Portugal Porto Adventures you can explore more of the beautiful portuguese cities, by
			walking on food, meeting the locals and eat excellent food and wine`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Button($$renderer, {
					variant: 'light',
					color: 'blue',
					fullSize: true,
					override: { marginTop: '14px' },
					children: ($$renderer) => {
						$$renderer.push(`<!---->Book classic tour now`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}