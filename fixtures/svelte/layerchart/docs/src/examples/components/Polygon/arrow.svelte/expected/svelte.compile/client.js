import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Group, Layer, Polygon } from 'layerchart';
import PolygonControls from '$lib/components/controls/PolygonControls.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Arrow($$anchor, $$props) {
	$.push($$props, true);

	let cornerRadius = $.state(0);
	const data = undefined;
	var $$exports = { data };
	var fragment = root();
	var node = $.first_child(fragment);

	PolygonControls(node, {
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

						Group($$anchor, {
							get x() {
								return $.get($0);
							},

							get y() {
								return $.get($1);
							},

							children: ($$anchor, $$slotProps) => {
								const size = $.derived(() => 60);

								Polygon($$anchor, {
									points: [
										{ x: $.get(size), y: 0 },
										{ x: $.get(size) / 4, y: -$.get(size) / 2 },
										{ x: $.get(size) / 4, y: -$.get(size) / 4 },
										{ x: -$.get(size), y: -$.get(size) / 4 },
										{ x: -$.get(size), y: $.get(size) / 4 },
										{ x: $.get(size) / 4, y: $.get(size) / 4 },
										{ x: $.get(size) / 4, y: $.get(size) / 2 },
										{ x: $.get(size), y: 0 }
									],

									get cornerRadius() {
										return $.get(cornerRadius);
									}
								});
							},
							$$slots: { default: true }
						});
					}
				},
				$$slots: { default: true }
			});
		};

		Chart(node_1, { height: 150, children, $$slots: { default: true } });
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}