import * as $ from 'svelte/internal/server';
import { useStage, useTask, useThrelte } from '@threlte/core';
import { ThreePerf } from 'three-perf';

export default function PerfMonitor($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			domElement = document.body,
			logsPerSecond = 10,
			showGraph = true,
			memory = true,
			enabled = true,
			visible = true,
			actionToCallUI = '',
			guiVisible = false,
			backgroundOpacity = 0.7,
			scale = 1,
			anchorX = 'left',
			anchorY = 'top'
		} = $$props;

		const { renderer, renderStage, mainStage } = useThrelte();
		let perf;

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
	});
}