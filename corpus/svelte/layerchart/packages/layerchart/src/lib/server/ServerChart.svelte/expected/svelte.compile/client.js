import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Chart from '$lib/components/Chart/Chart.svelte';
import Canvas from '$lib/components/layers/Canvas.svelte';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'capture',
	'onCapture'
]);

export default function ServerChart($$anchor, $$props) {
	let chartProps = $.rest_props($$props, rest_excludes);

	Chart($$anchor, $.spread_props({ ssr: true }, () => chartProps, {
		children: ($$anchor, $$slotProps) => {
			Canvas($$anchor, {
				get ssrCapture() {
					return $$props.capture;
				},

				get ssrCaptureCallback() {
					return $$props.onCapture;
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_2 = $.comment();
					var node = $.first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							var fragment_3 = $.comment();
							var node_1 = $.first_child(fragment_3);

							$.snippet(node_1, () => $$props.children);
							$.append($$anchor, fragment_3);
						};

						$.if(node, ($$render) => {
							if ($$props.children) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	}));
}