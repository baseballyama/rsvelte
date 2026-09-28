import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { GLTF, useGltfAnimations } from '@threlte/extras';

export default function Character($$anchor, $$props) {
	$.push($$props, true);

	const $actions = () => $.store_get(actions, '$actions', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let actionKey = $.prop($$props, 'actionKey', 3, 'idle');
	let gltf = $.state(void 0);
	let { actions } = useGltfAnimations(() => $.get(gltf));
	let currentActionKey = 'idle';

	$.user_effect(() => {
		// This effect acts like an init default pose
		$actions().idle?.play();
	});

	$.user_effect(() => {
		transitionTo(actionKey(), 0.3);
	});

	function transitionTo(actionKey, duration = 1) {
		const currentAction = $actions()[currentActionKey];
		const nextAction = $actions()[actionKey];

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

	GLTF($$anchor, {
		url: 'https://threejs.org/examples/models/gltf/Xbot.glb',
		oncreate: (scene) => {
			scene.traverse((child) => {
				child.castShadow = true;
			});
		},

		get gltf() {
			return $.get(gltf);
		},

		set gltf($$value) {
			$.set(gltf, $$value, true);
		}
	});

	$.pop();
	$$cleanup();
}