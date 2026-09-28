import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Layer, Pattern, Rect } from 'layerchart';

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function With_fill_color($$anchor) {
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
								}
							});
						};

						Pattern(node, {
							size: 4,
							circles: { color: 'white', opacity: 0.25 },
							background: 'hsl(20 100% 50%)',
							children,
							$$slots: { default: true }
						});
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
								}
							});
						};

						Pattern(node_1, {
							size: 8,
							circles: { color: 'white', opacity: 0.6 },
							background: 'hsl(150 100% 45%)',
							children,
							$$slots: { default: true }
						});
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
								}
							});
						};

						Pattern(node_2, {
							size: 8,
							circles: { color: 'white', opacity: 0.6, stagger: true },
							background: 'hsl(210 100% 50%)',
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
								}
							});
						};

						Pattern(node_3, {
							size: 8,
							circles: { color: 'white', opacity: 0.6, stagger: true, radius: 2 },
							background: 'hsl(260 100% 50%)',
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
								}
							});
						};

						Pattern(node_4, {
							size: 4,
							lines: { color: 'white', opacity: 0.5 },
							background: 'hsl(40 100% 50%)',
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
								}
							});
						};

						Pattern(node_5, {
							size: 4,
							lines: [
								{ color: 'black', opacity: 0.1 },
								{ color: 'black', opacity: 0.1, rotate: 90 }
							],
							background: 'hsl(360 100% 40%)',
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