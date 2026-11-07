import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { setContext } from 'svelte';
import { createRapierContext } from '../../lib/createRapierContext.js';

export default function InnerWorld($$anchor, $$props) {
	$.push($$props, true);

	let gravity = $.prop($$props, 'gravity', 19, () => [0, -9.81, 0]),
		autoStart = $.prop($$props, 'autoStart', 3, true);

	const rapierContext = createRapierContext(
		[
			{ x: gravity()[0], y: gravity()[1], z: gravity()[2] },
			$$props.rawIntegrationParameters,
			$$props.rawIslands,
			$$props.rawBroadPhase,
			$$props.rawNarrowPhase,
			$$props.rawBodies,
			$$props.rawColliders,
			$$props.rawImpulseJoints,
			$$props.rawMultibodyJoints,
			$$props.rawCCDSolver,
			$$props.rawQueryPipeline,
			$$props.rawPhysicsPipeline,
			$$props.rawSerializationPipeline,
			$$props.rawDebugRenderPipeline
		],
		{
			framerate: $$props.framerate,
			autoStart: autoStart(),
			simulationStageOptions: $$props.simulationStageOptions,
			synchronizationStageOptions: $$props.synchronizationStageOptions
		}
	);

	setContext('threlte-rapier-context', rapierContext);

	$.user_effect(() => {
		if (gravity() !== undefined) {
			rapierContext.world.gravity = { x: gravity()[0], y: gravity()[1], z: gravity()[2] };
		}
	});

	$.user_effect(() => {
		if ($$props.framerate !== undefined) rapierContext.framerate.set($$props.framerate);
	});

	$.user_effect(() => {
		return () => {
			rapierContext.world.free();
		};
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.append($$anchor, fragment);
	$.pop();
}