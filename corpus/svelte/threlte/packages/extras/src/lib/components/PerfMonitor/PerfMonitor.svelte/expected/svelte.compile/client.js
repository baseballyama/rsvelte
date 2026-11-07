import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useStage, useTask, useThrelte } from '@threlte/core';
import { ThreePerf } from 'three-perf';

export default function PerfMonitor($$anchor, $$props) {
	$.push($$props, true);

	let domElement = $.prop($$props, 'domElement', 19, () => document.body),
		logsPerSecond = $.prop($$props, 'logsPerSecond', 3, 10),
		showGraph = $.prop($$props, 'showGraph', 3, true),
		memory = $.prop($$props, 'memory', 3, true),
		enabled = $.prop($$props, 'enabled', 3, true),
		visible = $.prop($$props, 'visible', 3, true),
		actionToCallUI = $.prop($$props, 'actionToCallUI', 3, ''),
		guiVisible = $.prop($$props, 'guiVisible', 3, false),
		backgroundOpacity = $.prop($$props, 'backgroundOpacity', 3, 0.7),
		scale = $.prop($$props, 'scale', 3, 1),
		anchorX = $.prop($$props, 'anchorX', 3, 'left'),
		anchorY = $.prop($$props, 'anchorY', 3, 'top');

	const { renderer, renderStage, mainStage } = useThrelte();
	let perf;

	$.user_pre_effect(() => {
		perf = new ThreePerf({ domElement: domElement(), renderer });

		return () => perf.dispose();
	});

	$.user_pre_effect(() => {
		perf.logsPerSecond = logsPerSecond();
		perf.showGraph = showGraph();
		perf.memory = memory();
		perf.enabled = enabled();
		perf.visible = visible();
		perf.actionToCallUI = actionToCallUI();
		perf.guiVisible = guiVisible();
		perf.backgroundOpacity = backgroundOpacity();
		perf.scale = scale();
		perf.anchorX = anchorX();
		perf.anchorY = anchorY();
	});

	useTask(
		() => {
			perf.begin();
		},
		{ stage: useStage('monitor-begin', { before: mainStage }) }
	);

	useTask(
		() => {
			perf.end();
		},
		{ stage: useStage('monitor-end', { after: renderStage }) }
	);

	$.pop();
}