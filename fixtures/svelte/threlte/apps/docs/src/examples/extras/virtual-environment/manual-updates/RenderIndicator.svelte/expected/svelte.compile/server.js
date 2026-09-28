import * as $ from 'svelte/internal/server';
import { useStage, useTask, useThrelte } from '@threlte/core';
import { WaveformMonitor } from 'svelte-tweakpane-ui';

export default function RenderIndicator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { shouldRender, renderStage } = useThrelte();
		const afterRenderStage = useStage('after-render', { after: renderStage });
		let log = new Array(100).fill(0);

		useTask(
			() => {
				const [, ...rest] = log;

				log = [...rest, +shouldRender()];
			},
			{ autoInvalidate: false, stage: afterRenderStage }
		);

		WaveformMonitor($$renderer, { label: 'Render Activity', value: log, min: -1, max: 2 });
	});
}