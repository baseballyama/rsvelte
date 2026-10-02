import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Layer, Pattern, Rect } from 'layerchart';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Circles($$anchor) {
	Chart($$anchor, {
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					{
						const children = ($$anchor, $$arg0) => {
							let pattern = () => ($$arg0?.()).pattern;

							Rect($$anchor, {
								x: 120 * 0,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								get fill() {
									return pattern();
								},
								stroke: 'var(--color-surface-content)'
							});
						};

						Pattern(node, { size: 4, circles: true, children, $$slots: { default: true } });
					}

					var node_1 = $.sibling(node, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let pattern = () => ($$arg0?.()).pattern;

							Rect($$anchor, {
								x: 120 * 1,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								get fill() {
									return pattern();
								},
								stroke: 'var(--color-surface-content)'
							});
						};

						Pattern(node_1, { size: 8, circles: true, children, $$slots: { default: true } });
					}

					var node_2 = $.sibling(node_1, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let pattern = () => ($$arg0?.()).pattern;

							Rect($$anchor, {
								x: 120 * 2,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								get fill() {
									return pattern();
								},
								stroke: 'var(--color-surface-content)'
							});
						};

						Pattern(node_2, {
							size: 8,
							circles: { stagger: true },
							children,
							$$slots: { default: true }
						});
					}

					var node_3 = $.sibling(node_2, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let pattern = () => ($$arg0?.()).pattern;

							Rect($$anchor, {
								x: 120 * 3,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								get fill() {
									return pattern();
								},
								stroke: 'var(--color-surface-content)'
							});
						};

						Pattern(node_3, {
							size: 8,
							circles: { radius: 2 },
							children,
							$$slots: { default: true }
						});
					}

					var node_4 = $.sibling(node_3, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let pattern = () => ($$arg0?.()).pattern;

							Rect($$anchor, {
								x: 120 * 4,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								get fill() {
									return pattern();
								},
								stroke: 'var(--color-surface-content)'
							});
						};

						Pattern(node_4, {
							size: 8,
							circles: { radius: 2, stagger: true },
							children,
							$$slots: { default: true }
						});
					}

					var node_5 = $.sibling(node_4, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let pattern = () => ($$arg0?.()).pattern;

							Rect($$anchor, {
								x: 120 * 5,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								get fill() {
									return pattern();
								},
								stroke: 'var(--color-surface-content)'
							});
						};

						Pattern(node_5, {
							size: 8,
							circles: { radius: 2, opacity: 0.3 },
							children,
							$$slots: { default: true }
						});
					}

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}