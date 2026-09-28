import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Text, Stack } from '@svelteuidev/core';
import { useDebounce } from '@svelteuidev/composables';

const code = `
	<script>
		import { Button, Text, Stack } from '@svelteuidev/core';
		import { useDebounce } from '@svelteuidev/composables';

		let updated = 0;
		let clicked = 0;
		const debouncedFn = useDebounce(() => {
			updated += 1;
		}, 1000);
		const clickedFn = () => {
			clicked += 1;
			debouncedFn();
		};
	<\/script>
	
	<Stack align="center">
		<Button on:click={clickedFn}>Smash me!</Button>
		<Text root="note" size="sm">Delay is set to 1000ms for this demo.</Text>

		<Text>Button clicked: {clicked}</Text>
		<Text>Event handler called: {updated}</Text>
	</Stack>
	`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Usage($$anchor, $$props) {
	$.push($$props, true);

	let updated = 0;
	let clicked = 0;

	const debouncedFn = useDebounce(
		() => {
			updated += 1;
		},
		1000
	);

	const clickedFn = () => {
		clicked += 1;
		debouncedFn();
	};

	Stack($$anchor, {
		align: 'center',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Button(node, {
				$$events: { click: clickedFn },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Smash me!');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Text(node_1, {
				root: 'note',
				size: 'sm',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Delay is set to 1000ms for this demo.');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Text(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text();

					$.template_effect(() => $.set_text(text_2, `Button clicked: ${clicked ?? ''}`));
					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Text(node_3, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text();

					$.template_effect(() => $.set_text(text_3, `Event handler called: ${updated ?? ''}`));
					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}