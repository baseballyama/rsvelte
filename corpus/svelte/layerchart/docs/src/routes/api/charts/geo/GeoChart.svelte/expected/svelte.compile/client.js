import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ServerChart } from 'layerchart/server';
import { GeoPath } from 'layerchart/geo';

export default function GeoChart($$anchor, $$props) {
	$.push($$props, true);

	{
		let $0 = $.derived(() => ({ projection: $$props.projection, fitGeojson: $$props.states }));

		ServerChart($$anchor, {
			get capture() {
				return $$props.capture;
			},

			get onCapture() {
				return $$props.onCapture;
			},

			get width() {
				return $$props.width;
			},

			get height() {
				return $$props.height;
			},

			get geo() {
				return $.get($0);
			},
			padding: { top: 10, right: 10, bottom: 10, left: 10 },
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node = $.first_child(fragment_1);

				$.each(node, 16, () => $$props.states.features, (feature) => feature, ($$anchor, feature) => {
					GeoPath($$anchor, {
						get geojson() {
							return feature;
						},
						fill: 'rgba(59, 130, 246, 0.15)',
						stroke: 'rgb(59, 130, 246)',
						strokeWidth: 0.5
					});
				});

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}