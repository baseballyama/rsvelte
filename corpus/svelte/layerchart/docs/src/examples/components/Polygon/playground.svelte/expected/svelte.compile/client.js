import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Layer, Polygon } from 'layerchart';
import PolygonPlaygroundControls from '$lib/components/controls/PolygonPlaygroundControls.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Playground($$anchor) {
	let config = $.state($.proxy({
		points: 8,
		cornerRadius: 0,
		inset: 0,
		rotate: 0,
		scaleX: 1,
		scaleY: 1,
		skewX: 0,
		skewY: 0,
		tiltX: 0,
		tiltY: 0
	}));

	var fragment = root();
	var node = $.first_child(fragment);

	PolygonPlaygroundControls(node, {
		get config() {
			return $.get(config);
		},

		set config($$value) {
			$.set(config, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					{
						let $0 = $.derived(() => context().width / 2);
						let $1 = $.derived(() => context().height / 2);

						Polygon($$anchor, $.spread_props(
							{
								get cx() {
									return $.get($0);
								},

								get cy() {
									return $.get($1);
								},
								r: 100
							},
							() => $.get(config)
						));
					}
				},
				$$slots: { default: true }
			});
		};

		Chart(node_1, { height: 300, children, $$slots: { default: true } });
	}

	$.append($$anchor, fragment);
}