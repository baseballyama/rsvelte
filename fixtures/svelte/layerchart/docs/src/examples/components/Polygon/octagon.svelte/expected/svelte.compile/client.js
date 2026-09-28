import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Layer, Polygon } from 'layerchart';
import PolygonControls from '$lib/components/controls/PolygonControls.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Octagon($$anchor) {
	let rotate = $.state(0);
	let cornerRadius = $.state(0);
	var fragment = root();
	var node = $.first_child(fragment);

	PolygonControls(node, {
		get rotate() {
			return $.get(rotate);
		},

		set rotate($$value) {
			$.set(rotate, $$value, true);
		},

		get cornerRadius() {
			return $.get(cornerRadius);
		},

		set cornerRadius($$value) {
			$.set(cornerRadius, $$value, true);
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

						Polygon($$anchor, {
							get cx() {
								return $.get($0);
							},

							get cy() {
								return $.get($1);
							},
							r: 60,
							points: 8,
							get rotate() {
								return $.get(rotate);
							},

							get cornerRadius() {
								return $.get(cornerRadius);
							}
						});
					}
				},
				$$slots: { default: true }
			});
		};

		Chart(node_1, { height: 150, children, $$slots: { default: true } });
	}

	$.append($$anchor, fragment);
}