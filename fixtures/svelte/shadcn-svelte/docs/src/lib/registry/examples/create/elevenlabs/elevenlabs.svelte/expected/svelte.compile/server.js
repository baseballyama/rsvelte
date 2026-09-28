import * as $ from 'svelte/internal/server';
import BarVisualizerDemo from "./bar-visualizer-demo.svelte";
import WaveformDemo from "./waveform-demo.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

export default function Elevenlabs($$renderer) {
	ExampleWrapper($$renderer, {
		children: ($$renderer) => {
			BarVisualizerDemo($$renderer, {});
			$$renderer.push(`<!----> `);
			WaveformDemo($$renderer, {});
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}