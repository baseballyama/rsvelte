import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, ClipPath, Frame, Layer, Pattern, Polygon } from 'layerchart';

var root = $.from_html(`<!> <!>`, 1);

export default function Use_id($$anchor) {
	{
		const children = ($$anchor, $$arg0) => {
			let context = () => ($$arg0?.()).context;

			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					{
						let $0 = $.derived(() => context().width / 2);
						let $1 = $.derived(() => context().height / 2);

						Polygon(node, {
							id: 'star-shape',
							get cx() {
								return $.get($0);
							},

							get cy() {
								return $.get($1);
							},
							r: 120,
							points: 10,
							inset: 0.5,
							class: 'fill-none stroke-2 stroke-surface-content'
						});
					}

					var node_1 = $.sibling(node, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let pattern = () => ($$arg0?.()).pattern;

							ClipPath($$anchor, {
								useId: 'star-shape',
								children: ($$anchor, $$slotProps) => {
									Frame($$anchor, {
										get fill() {
											return pattern();
										},
										class: 'stroke-surface-content'
									});
								},
								$$slots: { default: true }
							});
						};

						Pattern(node_1, {
							size: 6,
							lines: [{ rotate: 45 }, { rotate: -45 }],
							children,
							$$slots: { default: true }
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		};

		Chart($$anchor, { height: 300, children, $$slots: { default: true } });
	}
}