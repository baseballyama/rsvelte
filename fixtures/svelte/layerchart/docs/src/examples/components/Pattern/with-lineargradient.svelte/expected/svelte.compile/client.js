import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Layer, LinearGradient, Pattern, Rect } from 'layerchart';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function With_lineargradient($$anchor) {
	Chart($$anchor, {
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node = $.first_child(fragment_2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;
							var fragment_3 = root();
							var node_1 = $.first_child(fragment_3);

							Rect(node_1, {
								x: 120 * 0,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								get fill() {
									return gradient();
								}
							});

							var node_2 = $.sibling(node_1, 2);

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

								Pattern(node_2, {
									size: 4,
									circles: { color: 'white', opacity: 0.5 },
									children,
									$$slots: { default: true }
								});
							}

							$.append($$anchor, fragment_3);
						};

						LinearGradient(node, {
							stops: ['hsl(60 100% 50%)', 'hsl(30 100% 40%)'],
							children,
							$$slots: { default: true }
						});
					}

					var node_3 = $.sibling(node, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;
							var fragment_5 = root();
							var node_4 = $.first_child(fragment_5);

							Rect(node_4, {
								x: 120 * 1,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								get fill() {
									return gradient();
								}
							});

							var node_5 = $.sibling(node_4, 2);

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

								Pattern(node_5, {
									size: 8,
									circles: { color: 'white', opacity: 0.5 },
									children,
									$$slots: { default: true }
								});
							}

							$.append($$anchor, fragment_5);
						};

						LinearGradient(node_3, {
							stops: ['hsl(60 100% 50%)', 'hsl(140 100% 40%)'],
							rotate: 45,
							children,
							$$slots: { default: true }
						});
					}

					var node_6 = $.sibling(node_3, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;
							var fragment_7 = root();
							var node_7 = $.first_child(fragment_7);

							Rect(node_7, {
								x: 120 * 2,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								get fill() {
									return gradient();
								}
							});

							var node_8 = $.sibling(node_7, 2);

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

								Pattern(node_8, {
									size: 8,
									circles: { color: 'white', opacity: 0.5, stagger: true },
									children,
									$$slots: { default: true }
								});
							}

							$.append($$anchor, fragment_7);
						};

						LinearGradient(node_6, {
							stops: ['hsl(195 100% 50%)', 'hsl(270 100% 30%)'],
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}

					var node_9 = $.sibling(node_6, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;
							var fragment_9 = root();
							var node_10 = $.first_child(fragment_9);

							Rect(node_10, {
								x: 120 * 3,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								get fill() {
									return gradient();
								}
							});

							var node_11 = $.sibling(node_10, 2);

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

								Pattern(node_11, {
									size: 8,
									circles: { color: 'white', opacity: 0.5, stagger: true, radius: 2 },
									children,
									$$slots: { default: true }
								});
							}

							$.append($$anchor, fragment_9);
						};

						LinearGradient(node_9, {
							stops: ['hsl(60 100% 50%)', 'hsl(30 100% 40%)'],
							children,
							$$slots: { default: true }
						});
					}

					var node_12 = $.sibling(node_9, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;
							var fragment_11 = root();
							var node_13 = $.first_child(fragment_11);

							Rect(node_13, {
								x: 120 * 4,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								get fill() {
									return gradient();
								}
							});

							var node_14 = $.sibling(node_13, 2);

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

								Pattern(node_14, {
									size: 4,
									lines: { color: 'white', opacity: 0.5 },
									children,
									$$slots: { default: true }
								});
							}

							$.append($$anchor, fragment_11);
						};

						LinearGradient(node_12, {
							stops: ['hsl(60 100% 50%)', 'hsl(140 100% 40%)'],
							rotate: 45,
							children,
							$$slots: { default: true }
						});
					}

					var node_15 = $.sibling(node_12, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;
							var fragment_13 = root();
							var node_16 = $.first_child(fragment_13);

							Rect(node_16, {
								x: 120 * 5,
								y: 0,
								width: 100,
								height: 300,
								rx: 8,
								get fill() {
									return gradient();
								}
							});

							var node_17 = $.sibling(node_16, 2);

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

								Pattern(node_17, {
									size: 4,
									lines: [
										{ color: 'black', opacity: 0.1 },
										{ color: 'black', opacity: 0.1, rotate: 90 }
									],
									children,
									$$slots: { default: true }
								});
							}

							$.append($$anchor, fragment_13);
						};

						LinearGradient(node_15, {
							stops: ['hsl(195 100% 50%)', 'hsl(270 100% 30%)'],
							vertical: true,
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