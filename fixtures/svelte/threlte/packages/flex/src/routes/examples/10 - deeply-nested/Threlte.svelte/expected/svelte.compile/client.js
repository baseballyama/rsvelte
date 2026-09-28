import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Flex, Box } from '$lib/index.js';
import Plane from '../../Plane.svelte';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Threlte($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Plane(node, { width: 500, height: 500, color: 'red' });

	var node_1 = $.sibling(node, 2);

	Flex(node_1, {
		width: 500,
		height: 500,
		justifyContent: 'Center',
		alignItems: 'Stretch',
		gap: 20,
		padding: 20,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			{
				const children = ($$anchor, $$arg0) => {
					let width = () => ($$arg0?.()).width;
					let height = () => ($$arg0?.()).height;
					var fragment_2 = root_1();
					var node_3 = $.first_child(fragment_2);

					Plane(node_3, {
						color: 'yellow',
						get width() {
							return width();
						},

						get height() {
							return height();
						},
						depth: 1
					});

					var node_4 = $.sibling(node_3, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let width = () => ($$arg0?.()).width;
							let height = () => ($$arg0?.()).height;

							Plane($$anchor, {
								color: 'fuchsia',
								get width() {
									return width();
								},

								get height() {
									return height();
								},
								depth: 2
							});
						};

						Box(node_4, {
							flex: 1,
							width: 'auto',
							height: 'auto',
							children,
							$$slots: { default: true }
						});
					}

					var node_5 = $.sibling(node_4, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let width = () => ($$arg0?.()).width;
							let height = () => ($$arg0?.()).height;
							var fragment_4 = root();
							var node_6 = $.first_child(fragment_4);

							Plane(node_6, {
								color: 'orange',
								get width() {
									return width();
								},

								get height() {
									return height();
								},
								depth: 2
							});

							var node_7 = $.sibling(node_6, 2);

							{
								const children = ($$anchor, $$arg0) => {
									let width = () => ($$arg0?.()).width;
									let height = () => ($$arg0?.()).height;

									Plane($$anchor, {
										color: 'red',
										get width() {
											return width();
										},

										get height() {
											return height();
										},
										depth: 3
									});
								};

								Box(node_7, {
									width: 100,
									height: 100,
									children,
									$$slots: { default: true }
								});
							}

							$.append($$anchor, fragment_4);
						};

						Box(node_5, {
							flex: 1,
							width: 'auto',
							height: 'auto',
							justifyContent: 'Center',
							alignItems: 'Center',
							children,
							$$slots: { default: true }
						});
					}

					$.append($$anchor, fragment_2);
				};

				Box(node_2, {
					width: 'auto',
					height: 'auto',
					flex: 1,
					gap: 20,
					padding: 20,
					flexDirection: 'Column',
					children,
					$$slots: { default: true }
				});
			}

			var node_8 = $.sibling(node_2, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let width = () => ($$arg0?.()).width;
					let height = () => ($$arg0?.()).height;
					var fragment_6 = root_1();
					var node_9 = $.first_child(fragment_6);

					Plane(node_9, {
						color: 'blue',
						get width() {
							return width();
						},

						get height() {
							return height();
						},
						depth: 1
					});

					var node_10 = $.sibling(node_9, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let width = () => ($$arg0?.()).width;
							let height = () => ($$arg0?.()).height;

							Plane($$anchor, {
								color: 'pink',
								get width() {
									return width();
								},

								get height() {
									return height();
								},
								depth: 2
							});
						};

						Box(node_10, {
							flex: 1,
							width: 'auto',
							height: 100,
							children,
							$$slots: { default: true }
						});
					}

					var node_11 = $.sibling(node_10, 2);

					{
						const children = ($$anchor, $$arg0) => {
							let width = () => ($$arg0?.()).width;
							let height = () => ($$arg0?.()).height;

							Plane($$anchor, {
								color: 'hotpink',
								get width() {
									return width();
								},

								get height() {
									return height();
								},
								depth: 2
							});
						};

						Box(node_11, {
							flex: 1,
							width: 'auto',
							height: 100,
							alignSelf: 'FlexEnd',
							children,
							$$slots: { default: true }
						});
					}

					$.append($$anchor, fragment_6);
				};

				Box(node_8, {
					width: 'auto',
					height: 'auto',
					flex: 0.5,
					alignItems: 'Stretch',
					padding: 20,
					children,
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}