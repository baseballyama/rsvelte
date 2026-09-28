import * as $ from 'svelte/internal/server';
import { Canvas } from '@threlte/core';
import { Checkbox, Pane, ThemeUtils, Separator } from 'svelte-tweakpane-ui';
import Scene from './Scene.svelte';

export default function App($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let settings = {
			wireframe: false,
			background: false,
			border: true,
			enemy: false,
			player: false,
			potion: false,
			turtle: true,
			heart: true,
			runeState: false,
			runeHost: false,
			runeEffect: false
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="svelte-zc9cpk">`);

			Canvas($$renderer, {
				children: ($$renderer) => {
					Scene($$renderer, { settings });
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div> `);

			Pane($$renderer, {
				theme: ThemeUtils.presets.light,
				position: 'fixed',
				title: 'GLTF file',
				children: ($$renderer) => {
					Checkbox($$renderer, {
						label: 'wireframe',
						get value() {
							return settings.wireframe;
						},

						set value($$value) {
							settings.wireframe = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);
					Separator($$renderer, {});
					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'border',
						get value() {
							return settings.border;
						},

						set value($$value) {
							settings.border = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'heart',
						get value() {
							return settings.heart;
						},

						set value($$value) {
							settings.heart = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'turtle',
						get value() {
							return settings.turtle;
						},

						set value($$value) {
							settings.turtle = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'player',
						get value() {
							return settings.player;
						},

						set value($$value) {
							settings.player = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'enemy',
						get value() {
							return settings.enemy;
						},

						set value($$value) {
							settings.enemy = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'potion',
						get value() {
							return settings.potion;
						},

						set value($$value) {
							settings.potion = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'host rune',
						get value() {
							return settings.runeHost;
						},

						set value($$value) {
							settings.runeHost = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> `);

					Checkbox($$renderer, {
						label: 'effect rune',
						get value() {
							return settings.runeEffect;
						},

						set value($$value) {
							settings.runeEffect = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}