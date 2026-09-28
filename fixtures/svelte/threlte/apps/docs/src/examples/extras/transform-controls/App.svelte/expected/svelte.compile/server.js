import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import Scene from './Scene.svelte';
import Settings from './Settings.svelte';

export default function App($$renderer) {
	let controls = '<OrbitControls>';
	let autoPauseControls = true;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="svelte-1909cwx">`);

		Canvas($$renderer, {
			children: ($$renderer) => {
				Scene($$renderer, { controls, autoPauseControls });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> `);

		Settings($$renderer, {
			get controls() {
				return controls;
			},

			set controls($$value) {
				controls = $$value;
				$$settled = false;
			},

			get autoPauseControls() {
				return autoPauseControls;
			},

			set autoPauseControls($$value) {
				autoPauseControls = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}