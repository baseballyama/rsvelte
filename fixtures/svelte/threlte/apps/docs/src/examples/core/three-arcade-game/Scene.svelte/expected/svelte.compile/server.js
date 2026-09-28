import * as $ from 'svelte/internal/server';
import { AudioListener, interactivity } from '@threlte/extras';
import { Debug } from '@threlte/rapier';
import { AudioListener as ThreeAudioListener } from 'three';
import ArcadeScene from './arcade/Scene.svelte';
import GameScene from './game/Scene.svelte';
import { game } from './game/Game.svelte';
import { provideArcadeControls } from './game/controls.svelte';
import CustomRendering from './Renderer.svelte';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		interactivity();
		provideArcadeControls();

		let listener = void 0;
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			AudioListener($$renderer, {
				autoResume: true,
				masterVolume: game.muted ? 0 : 1,
				get ref() {
					return listener;
				},

				set ref($$value) {
					listener = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> `);

			if (game.debug) {
				$$renderer.push('<!--[0-->');
				Debug($$renderer, {});
			} else {
				$$renderer.push('<!--[-1-->');
				CustomRendering($$renderer, {});
			}

			$$renderer.push(`<!--]--> `);
			ArcadeScene($$renderer, {});
			$$renderer.push(`<!----> `);
			GameScene($$renderer, {});
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