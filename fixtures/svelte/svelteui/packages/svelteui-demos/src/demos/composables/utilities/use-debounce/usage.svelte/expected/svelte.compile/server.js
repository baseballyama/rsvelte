import * as $ from 'svelte/internal/server';
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

export default function Usage($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		Stack($$renderer, {
			align: 'center',
			children: ($$renderer) => {
				Button($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Smash me!`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Text($$renderer, {
					root: 'note',
					size: 'sm',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Delay is set to 1000ms for this demo.`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Text($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Button clicked: ${$.escape(clicked)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Text($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Event handler called: ${$.escape(updated)}`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}