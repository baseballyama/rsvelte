import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BarVisualizerDemo from "./bar-visualizer-demo.svelte";
import WaveformDemo from "./waveform-demo.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Elevenlabs($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			BarVisualizerDemo(node, {});

			var node_1 = $.sibling(node, 2);

			WaveformDemo(node_1, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}