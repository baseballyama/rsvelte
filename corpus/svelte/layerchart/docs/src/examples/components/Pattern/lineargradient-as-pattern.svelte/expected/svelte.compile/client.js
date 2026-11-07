import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Chart, Layer, LinearGradient, Pattern, Rect } from 'layerchart';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Lineargradient_as_pattern($$anchor) {
	Chart($$anchor, {
		height: 300,
		children: ($$anchor, $$slotProps) => {
			Layer($$anchor, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node = $.first_child(fragment_2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;

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

								Pattern($$anchor, {
									size: 4,
									get background() {
										return gradient();
									},
									children,
									$$slots: { default: true }
								});
							}
						};

						LinearGradient(node, {
							stops: ['hsl(60 100% 50%)', 'hsl(30 100% 40%)'],
							children,
							$$slots: { default: true }
						});
					}

					var node_1 = $.sibling(node, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;

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

								Pattern($$anchor, {
									size: 4,
									get background() {
										return gradient();
									},
									children,
									$$slots: { default: true }
								});
							}
						};

						LinearGradient(node_1, {
							stops: ['hsl(60 100% 50%)', 'hsl(140 100% 40%)'],
							rotate: 45,
							children,
							$$slots: { default: true }
						});
					}

					var node_2 = $.sibling(node_1, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;

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

								Pattern($$anchor, {
									size: 4,
									get background() {
										return gradient();
									},
									children,
									$$slots: { default: true }
								});
							}
						};

						LinearGradient(node_2, {
							stops: ['hsl(195 100% 50%)', 'hsl(270 100% 30%)'],
							vertical: true,
							children,
							$$slots: { default: true }
						});
					}

					var node_3 = $.sibling(node_2, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;

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

								Pattern($$anchor, {
									size: 8,
									get background() {
										return gradient();
									},
									children,
									$$slots: { default: true }
								});
							}
						};

						LinearGradient(node_3, {
							stops: ['hsl(60 100% 50%)', 'hsl(30 100% 40%)'],
							children,
							$$slots: { default: true }
						});
					}

					var node_4 = $.sibling(node_3, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let gradient = () => ($$arg0?.()).gradient;

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

								Pattern($$anchor, {
									size: 8,
									get background() {
										return gradient();
									},
									children,
									$$slots: { default: true }
								});
							}
						};

						LinearGradient(node_4, {
							stops: ['hsl(60 100% 50%)', 'hsl(140 100% 40%)'],
							rotate: 45,
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