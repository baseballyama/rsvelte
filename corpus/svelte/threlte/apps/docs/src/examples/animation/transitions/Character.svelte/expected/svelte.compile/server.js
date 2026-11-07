import * as $ from 'svelte/internal/server';
import { GLTF, useGltfAnimations } from '@threlte/extras';

export default function Character($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let { actionKey = 'idle' } = $$props;
		let gltf = void 0;
		let { actions } = useGltfAnimations(() => gltf);
		let currentActionKey = 'idle';

		// This effect acts like an init default pose
		function transitionTo(actionKey, duration = 1) {
			const currentAction = $.store_get($$store_subs ??= {}, '$actions', actions)[currentActionKey];
			const nextAction = $.store_get($$store_subs ??= {}, '$actions', actions)[actionKey];

			if (!nextAction || currentAction === nextAction) return;

			// Function inspired by: https://github.com/mrdoob/three.js/blob/master/examples/webgl_animation_skinning_blending.html
			nextAction.enabled = true;

			if (currentAction) {
				currentAction.crossFadeTo(nextAction, duration, true);
			}

			// Not sure why I need this but the source code does not
			nextAction.play();

			currentActionKey = actionKey;
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