import * as $ from 'svelte/internal/server';
import { setContext } from 'svelte';
import { createRapierContext } from '../../lib/createRapierContext.js';

export default function InnerWorld($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			gravity = [0, -9.81, 0],
			rawIntegrationParameters,
			rawIslands,
			rawBroadPhase,
			rawNarrowPhase,
			rawBodies,
			rawColliders,
			rawImpulseJoints,
			rawMultibodyJoints,
			rawCCDSolver,
			rawQueryPipeline,
			rawPhysicsPipeline,
			rawSerializationPipeline,
			rawDebugRenderPipeline,
			framerate,
			autoStart = true,
			simulationStageOptions,
			synchronizationStageOptions,
			children
		} = $$props;

		const rapierContext = createRapierContext(
			[
				{ x: gravity[0], y: gravity[1], z: gravity[2] },
				rawIntegrationParameters,
				rawIslands,
				rawBroadPhase,
				rawNarrowPhase,
				rawBodies,
				rawColliders,
				rawImpulseJoints,
				rawMultibodyJoints,
				rawCCDSolver,
				rawQueryPipeline,
				rawPhysicsPipeline,
				rawSerializationPipeline,
				rawDebugRenderPipeline
			],
			{
				framerate,
				autoStart,
				simulationStageOptions,
				synchronizationStageOptions
			}
		);

		setContext('threlte-rapier-context', rapierContext);
		children?.($$renderer);
		$$renderer.push(`<!---->`);
	});
}