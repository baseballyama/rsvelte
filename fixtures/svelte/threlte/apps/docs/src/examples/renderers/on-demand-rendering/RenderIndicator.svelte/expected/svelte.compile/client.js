import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useStage, useTask, useThrelte } from '@threlte/core';
import { Pane, WaveformMonitor } from 'svelte-tweakpane-ui';

export default function RenderIndicator($$anchor, $$props) {
	$.push($$props, true);

	const { shouldRender, renderStage } = useThrelte();
	const afterRenderStage = useStage('after-render', { after: renderStage });
	let value = $.state(Array(100).fill(0));

	useTask(
		() => {
			$.set(value, [...$.get(value).slice(1), shouldRender() ? 1 : 0]);
		},
		{ autoInvalidate: false, stage: afterRenderStage }
	);

	Pane($$anchor, {
		title: 'Rendering Activity',
		position: 'fixed',
		children: ($$anchor, $$slotProps) => {
			WaveformMonitor($$anchor, {
				get value() {
					return $.get(value);
				},
				min: -1,
				max: 2
			});
		},
		$$slots: { default: true }
	});

	$.pop();
}