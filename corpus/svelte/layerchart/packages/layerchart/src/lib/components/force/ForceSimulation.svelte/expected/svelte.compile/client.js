import 'svelte/internal/disclose-version';
import { forceSimulation } from 'd3-force';
import * as $ from 'svelte/internal/client';
import { watch } from 'runed';

export const DEFAULT_ALPHA = 1;
export const DEFAULT_ALPHA_TARGET = 0;
export const DEFAULT_ALPHA_DECAY = 1 - Math.pow(0.001, 1 / 300);
export const DEFAULT_ALPHA_MIN = 0.01;
export const DEFAULT_VELOCITY_DECAY = 0.4;

export default function ForceSimulation($$anchor, $$props) {
	$.push($$props, true);

	let alpha = $.prop($$props, 'alpha', 15, DEFAULT_ALPHA),
		alphaTarget = $.prop($$props, 'alphaTarget', 3, DEFAULT_ALPHA_TARGET),
		alphaDecay = $.prop($$props, 'alphaDecay', 3, DEFAULT_ALPHA_DECAY),
		alphaMin = $.prop($$props, 'alphaMin', 3, DEFAULT_ALPHA_MIN),
		velocityDecay = $.prop($$props, 'velocityDecay', 3, DEFAULT_VELOCITY_DECAY),
		stopped = $.prop($$props, 'stopped', 3, false),
		cloneNodes = $.prop($$props, 'cloneNodes', 3, false);

	// MARK: Public Props
	// MARK: Private Props
	let linkPositions = $.state($.proxy([]));

	let simulatedNodes = $.state($.proxy([]));
	let simulatedLinks = $.derived(() => $$props.data.links ?? []);

	// This casting is unfortunately necessary, due to unfortunate
	// overloading choices made, over at `@typed/d3-force`:
	const simulation = forceSimulation().stop();

	// d3.Simulation does not provide a `.forces()` getter, so we need to
	// keep track of previous forces ourselves, for diffing against `forces`.
	let previousForces = {};

	let paused = true;

	// MARK: Reactivity Effects
	watch.pre(() => stopped(), () => {
		// Any time the `stopped` prop gets toggled we
		// update the running state of the simulation:
		if (stopped()) {
			pauseDynamicSimulation();
		} else {
			runOrResumeSimulation();
		}
	});

	watch.pre(() => $$props.static, () => {
		// Any time the `static` prop gets toggled we
		// either attach or detach our internal event listeners:
		if ($$props.static) {
			simulation.on('tick', null).on('end', null);
		} else {
			simulation.on('tick', onTick).on('end', onEnd);
		}

		runOrResumeSimulation();
	});

	watch.pre(() => $$props.data, () => {
		// Any time the `nodes` prop, or the `data` store gets changed
		// we pass them to the internal d3 simulation object:
		onNodesChange();

		pushNodesToSimulation($$props.data.nodes);
		runOrResumeSimulation();
	});

	watch.pre(() => $$props.forces, () => {
		// Any time the `forces` prop gets changed we
		// pass them to the internal d3 simulation object:
		pushForcesToSimulation($$props.forces);

		runOrResumeSimulation();
	});

	watch.pre(() => alpha(), () => {
		// Any time the `alpha` prop gets changed we
		// pass it to the internal d3 simulation object:
		pushAlphaToSimulation(alpha());

		// Then we attempt to resume the simulation:
		runOrResumeSimulation();
	});

	watch.pre(
		[
			() => alphaTarget(),
			() => alphaMin(),
			() => alphaDecay(),
			() => velocityDecay()
		],
		() => {
			// Any time any of the the alpha props get changed we
			// pass them all to the internal d3 simulation object
			// (they are cheap, so passing them as a batch is fine!):
			// We read `simulation.alpha()` instead of `alpha` here, so
			// Svelte does not trigger this block on any change to `alpha`:
			let alphaValue = simulation.alpha();

			if (alphaTarget() > alphaValue && alphaValue < alphaMin()) {
				// Lift `alpha` from below `alphaMin` in order to give the simulation
				// a chance to get revived if an `alphaTarget > alpha` is provided:
				alphaValue = alphaMin();
			}

			simulation.alpha(alphaValue).alphaTarget(alphaTarget()).alphaMin(alphaMin()).alphaDecay(alphaDecay()).velocityDecay(velocityDecay());
			runOrResumeSimulation();
		}
	);

	// MARK: Push State
	function pushAlphaToSimulation(alpha) {
		simulation.alpha(alpha);
	}

	function pushNodesToSimulation(nodes) {
		simulation.nodes(nodes);
	}

	function pushForcesToSimulation(forces) {
		// Evict obsolete forces:
		const names = Object.keys(previousForces);

		for (const name of names) {
			if (!(name in forces)) {
				simulation.force(name, null);
			}
		}

		const entries = Object.entries(forces);

		for (const [name, force] of entries) {
			if (!(name in previousForces) || force !== previousForces[name]) {
				simulation.force(name, force);
			}
		}

		previousForces = forces;
	}

	function updateLinkPositions() {
		// Keeping the link positions in sync with the simulation
		// so we don't need to recalculate _all_ link positions on each tick
		// which bogs down the simulation
		$.set(
			linkPositions,
			$.get(simulatedLinks).map((link) => ({
				x1: link.source.x ?? 0,
				y1: link.source.y ?? 0,
				x2: link.target.x ?? 0,
				y2: link.target.y ?? 0
			})),
			true
		);
	}

	// MARK: Pull State
	function pullNodesFromSimulation() {
		const simulationNodes = simulation.nodes();

		$.set(simulatedNodes, cloneNodes() ? structuredClone(simulationNodes) : simulationNodes, true);
	}

	function pullAlphaFromSimulation() {
		alpha(simulation.alpha());
	}

	// MARK: Resume / Pause
	function runOrResumeSimulation() {
		if ($$props.static) {
			runStaticSimulationToCompletion();
		} else {
			resumeDynamicSimulation();
		}
	}

	function runStaticSimulationToCompletion() {
		if (stopped()) {
			// If a simulation is marked as stopped, then it should not get started.
			return;
		}

		if (!$$props.static) {
			// Only static simulations are run to completion.
			return;
		}

		if (!paused) {
			// Pause any possibly still running dynamic simulation:
			pauseDynamicSimulation();
		}

		const ticks = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));

		pushAlphaToSimulation(1.0);
		onStart();

		for (let i = 0; i < ticks; ++i) {
			simulation.tick();
		}

		pullNodesFromSimulation();
		pullAlphaFromSimulation();
		onEnd();
	}

	function resumeDynamicSimulation() {
		if (!paused) {
			// No need to restart an already running simulation.
			return;
		}

		if (stopped()) {
			// If a simulation is marked as stopped, then it should not get resumed.
			return;
		}

		if ($$props.static) {
			// Only dynamic simulations can be resumed.
			return;
		}

		if (simulation.alpha() < simulation.alphaMin()) {
			// Only resume the simulation as long as `alpha`
			// is above the cut-off threshold of `alphaMin`,
			// otherwise our simulation will never terminate:
			return;
		}

		onStart();
		simulation.restart();

		// No need to call `onEnd();` for dynamic simulations
		// as the simulation itself takes care of firing `on:end`,
		// which then gets calls `onEnd();` for us.
	}

	function pauseDynamicSimulation() {
		if (paused) {
			// No need to pause an already paused simulation.
			return;
		}

		simulation.stop();
		onEnd();
	}

	// MARK: Event Listeners
	function onStart() {
		if (!paused) {
			// Avoid double-emissions of `start` event due to race conditions.
			return;
		}

		paused = false;
		$$props.onStart?.({ alpha: alpha(), alphaTarget: alphaTarget(), simulation });
	}

	function onTick() {
		pullNodesFromSimulation();
		pullAlphaFromSimulation();
		updateLinkPositions();

		$$props.onTick?.({
			alpha: alpha(),
			alphaTarget: alphaTarget(),
			nodes: $.get(simulatedNodes),
			links: $.get(simulatedLinks),
			simulation
		});
	}

	function onEnd() {
		if (paused) {
			// Avoid double-emissions of `end` event due to race conditions.
			return;
		}

		paused = true;
		$$props.onEnd?.({ alpha: alpha(), alphaTarget: alphaTarget(), simulation });
	}

	function onNodesChange() {
		$$props.onNodesChange?.({
			alpha: alpha(),
			alphaTarget: alphaTarget(),
			nodes: $$props.data.nodes,
			links: $$props.data.links ?? [],
			simulation
		});
	}

	$.user_effect(() => {
		return () => {
			simulation.stop();
			simulation.on('tick', null).on('end', null);
		};
	});

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.snippet(node, () => $$props.children ?? $.noop, () => ({
		nodes: $.get(simulatedNodes),
		links: $.get(simulatedLinks),
		simulation,
		linkPositions: $.get(linkPositions)
	}));

	$.append($$anchor, fragment);
	$.pop();
}