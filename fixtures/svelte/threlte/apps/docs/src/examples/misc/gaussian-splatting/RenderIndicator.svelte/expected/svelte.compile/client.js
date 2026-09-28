import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useStage, useTask, useThrelte } from '@threlte/core';
import { WaveformMonitor } from 'svelte-tweakpane-ui';

export default function RenderIndicator($$anchor, $$props) {
	$.push($$props, true);

	const { shouldRender, renderStage } = useThrelte();
	const afterRenderStage = useStage('after-render', { after: renderStage });
	let log = Array(100).fill(0);

	useTask(
		() => {
			log = update(log);
		},
		{ autoInvalidate: false, stage: afterRenderStage }
	);

	function update(log) {
		log.shift();
		log.push(shouldRender() ? 1 : 0);

		return log;
	}

	WaveformMonitor($$anchor, {
		get value() {
			return log;
		},
		min: -1,
		max: 2
	});

	$.pop();
}