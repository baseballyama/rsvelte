import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';
import { Pane, Slider } from '$lib';

export default function TestPane($$anchor, $$props) {
	$.push($$props, true);

	let tpPane;

	onMount(() => {
		// Have your way with the pane...
		tpPane.on('change', (event) => {
			console.log(event);
		});
	});

	let speed = 50;

	Pane($$anchor, {
		get tpPane() {
			return tpPane;
		},

		set tpPane($$value) {
			tpPane = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			Slider($$anchor, {
				max: 100,
				min: 0,
				get value() {
					return speed;
				},

				set value($$value) {
					speed = $$value;
				}
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}