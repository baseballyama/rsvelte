import * as $ from 'svelte/internal/server';
import { useStage, useTask, useThrelte } from '@threlte/core';
import { Pane, WaveformMonitor } from 'svelte-tweakpane-ui';

export default function RenderIndicator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { shouldRender, renderStage } = useThrelte();
		const afterRenderStage = useStage('after-render', { after: renderStage });
		let value = Array(100).fill(0);

		useTask(
			() => {
				value = [...value.slice(1), shouldRender() ? 1 : 0];
			},
			{ autoInvalidate: false, stage: afterRenderStage }
		);

		Pane($$renderer, {
			title: 'Rendering Activity',
			position: 'fixed',
			children: ($$renderer) => {
				WaveformMonitor($$renderer, { value, min: -1, max: 2 });
			},
			$$slots: { default: true }
		});
	});
}