import * as $ from 'svelte/internal/server';
import { GLTF, useGltfAnimations } from '@threlte/extras';

export default function Character($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { action = 'idle' } = $$props;
		let gltf = void 0;
		let { actions } = useGltfAnimations(() => gltf);
		let currentAction = 'idle';

		function transitionTo(next, duration = 0.2) {
			const current = $.store_get($$store_subs ??= {}, '$actions', actions)[currentAction];
			const nextAnim = $.store_get($$store_subs ??= {}, '$actions', actions)[next];

			if (!nextAnim || current === nextAnim) return;

			nextAnim.enabled = true;

			if (current) {
				current.crossFadeTo(nextAnim, duration, true);
			}

			nextAnim.play();
			currentAction = next;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			GLTF($$renderer, {
				url: 'https://threejs.org/examples/models/gltf/Xbot.glb',
				oncreate: (scene) => {
					scene.traverse((child) => {
						child.castShadow = true;
					});
				},

				get gltf() {
					return gltf;
				},

				set gltf($$value) {
					gltf = $$value;
					$$settled = false;
				}
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}