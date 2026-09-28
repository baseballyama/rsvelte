import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { GLTF, useGltfAnimations } from '@threlte/extras';

export default function Character($$anchor, $$props) {
	$.push($$props, true);

	const $actions = () => $.store_get(actions, '$actions', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	let action = $.prop($$props, 'action', 3, 'idle');
	let gltf = $.state(void 0);
	let { actions } = useGltfAnimations(() => $.get(gltf));
	let currentAction = 'idle';

	$.user_effect(() => {
		$actions()?.idle?.play();
	});

	$.user_effect(() => {
		transitionTo(action(), 0.2);
	});

	function transitionTo(next, duration = 0.2) {
		const current = $actions()[currentAction];
		const nextAnim = $actions()[next];

		if (!nextAnim || current === nextAnim) return;

		nextAnim.enabled = true;

		if (current) {
			current.crossFadeTo(nextAnim, duration, true);
		}

		nextAnim.play();
		currentAction = next;
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