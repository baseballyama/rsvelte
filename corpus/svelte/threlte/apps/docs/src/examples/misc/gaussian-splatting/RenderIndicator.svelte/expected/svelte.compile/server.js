import * as $ from 'svelte/internal/server';
import { useStage, useTask, useThrelte } from '@threlte/core';
import { WaveformMonitor } from 'svelte-tweakpane-ui';

export default function RenderIndicator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		WaveformMonitor($$renderer, { value: log, min: -1, max: 2 });
	});
}