import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useStage, useTask, useThrelte } from '@threlte/core';
import { WaveformMonitor } from 'svelte-tweakpane-ui';

export default function RenderIndicator($$anchor, $$props) {
	$.push($$props, true);

	const { shouldRender, renderStage } = useThrelte();
	const afterRenderStage = useStage('after-render', { after: renderStage });
	let log = $.state(new Array(100).fill(0));

	useTask(
		() => {
			const [, ...rest] = $.get(log);

			$.set(log, [...rest, +shouldRender()]);
		},
		{ autoInvalidate: false, stage: afterRenderStage }
	);

	WaveformMonitor($$anchor, {
		label: 'Render Activity',
		get value() {
			return $.get(log);
		},
		min: -1,
		max: 2
	});

	$.pop();
}