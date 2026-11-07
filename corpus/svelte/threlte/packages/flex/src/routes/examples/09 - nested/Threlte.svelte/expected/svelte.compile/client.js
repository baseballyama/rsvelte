import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Flex, Box } from '$lib/index.js';
import Plane from '../../Plane.svelte';

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Threlte($$anchor) {
	var fragment = root_1();
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
			var fragment_1 = root_1();
			var node_2 = $.first_child(fragment_1);

			{
				const children = ($$anchor, $$arg0) => {
					let width = () => ($$arg0?.()).width;
					let height = () => ($$arg0?.()).height;

					Plane($$anchor, {
						color: 'yellow',
						get width() {
							return width();
						},

						get height() {
							return height();
						},
						depth: 1
					});
				};

				Box(node_2, {
					width: 'auto',
					height: 'auto',
					flex: 1,
					children,
					$$slots: { default: true }
				});
			}

			var node_3 = $.sibling(node_2, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let width = () => ($$arg0?.()).width;
					let height = () => ($$arg0?.()).height;
					var fragment_3 = root();
					var node_4 = $.first_child(fragment_3);

					Plane(node_4, {
						color: 'blue',
						get width() {
							return width();
						},

						get height() {
							return height();
						},
						depth: 1
					});

					var node_5 = $.sibling(node_4, 2);

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

						Box(node_5, {
							flex: 1,
							width: 'auto',
							height: 100,
							children,
							$$slots: { default: true }
						});
					}

					var node_6 = $.sibling(node_5, 2);

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

						Box(node_6, {
							flex: 1,
							width: 'auto',
							height: 100,
							alignSelf: 'FlexEnd',
							children,
							$$slots: { default: true }
						});
					}

					$.append($$anchor, fragment_3);
				};

				Box(node_3, {
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