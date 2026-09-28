import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

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

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<div style="width: 340px; margin: auto"><!></div>`);

export default function Card_demo_usage($$anchor, $$props) {
	$.push($$props, true);

	const $colorScheme = () => $.store_get(colorScheme, '$colorScheme', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const { themeColor } = useSvelteUITheme().fn;
	const secondaryColor = $colorScheme() === 'dark' ? themeColor('dark', 1) : themeColor('dark', 7);
	var div = root_2();
	var node = $.child(div);

	Card(node, {
		shadow: 'sm',
		padding: 'lg',
		children: ($$anchor, $$slotProps) => {
			var fragment = root_1();
			var node_1 = $.first_child(fragment);

			$.component(node_1, () => Card.Section, ($$anchor, Card_Section) => {
				Card_Section($$anchor, {
					first: true,
					padding: 'lg',
					children: ($$anchor, $$slotProps) => {
						Image($$anchor, {
							src: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3540&q=80',
							height: 160,
							alt: 'Portugal'
						});
					},
					$$slots: { default: true }
				});
			});

			var node_2 = $.sibling(node_1, 2);

			Group(node_2, {
				position: 'apart',
				override: { marginBottom: '5px', marginTop: '$smPX' },
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					Text(node_3, {
						weight: 500,
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Portugal Porto Adventures');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					Badge(node_4, {
						color: 'pink',
						variant: 'light',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('On Sale');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_2, 2);

			{
				let $0 = $.derived(() => ({ color: secondaryColor, lineHeight: 1.5 }));

				Text(node_5, {
					size: 'sm',
					get override() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('With Portugal Porto Adventures you can explore more of the beautiful portuguese cities, by\n			walking on food, meeting the locals and eat excellent food and wine');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});
			}

			var node_6 = $.sibling(node_5, 2);

			Button(node_6, {
				variant: 'light',
				color: 'blue',
				fullSize: true,
				override: { marginTop: '14px' },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Book classic tour now');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
	$$cleanup();
}