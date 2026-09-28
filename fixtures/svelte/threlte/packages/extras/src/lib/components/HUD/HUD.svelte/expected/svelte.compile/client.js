import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T, createCameraContext, createSceneContext, useThrelte } from '@threlte/core';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'autoRender',
	'toneMapping',
	'stage',
	'ref',
	'children'
]);

export default function HUD($$anchor, $$props) {
	$.push($$props, true);

	const { renderStage, renderer, toneMapping } = useThrelte();

	let autoRender = $.prop($$props, 'autoRender', 3, true),
		stage = $.prop($$props, 'stage', 3, renderStage),
		ref = $.prop($$props, 'ref', 15),
		rest = $.rest_props($$props, rest_excludes);

	const { scene } = createSceneContext();
	const { camera } = createCameraContext();
	const key = Symbol('threlte-hud-render-stage');

	$.user_pre_effect(() => {
		if (!autoRender()) {
			return;
		}

		stage().createTask(key, () => {
			const { autoClear } = renderer;

			renderer.autoClear = false;
			renderer.toneMapping = $$props.toneMapping ?? toneMapping.current;
			renderer.clearDepth();
			renderer.render(scene, camera.current);
			renderer.autoClear = autoClear;
			renderer.toneMapping = toneMapping.current;
		});

		return () => stage().removeTask(key);
	});

	T($$anchor, $.spread_props(
		{
			get is() {
				return scene;
			},
			attach: false
		},
		() => rest,
		{
			get ref() {
				return ref();
			},

			set ref($$value) {
				ref($$value);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.snippet(node, () => $$props.children ?? $.noop, () => ({ ref: scene }));
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		}
	));

	$.pop();
}