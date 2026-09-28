import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Flex, Box } from '$lib/index.js';
import Plane from '../../Plane.svelte';

var root = $.from_html(`<!> <!>`, 1);

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

					Plane($$anchor, {
						color: 'blue',
						get width() {
							return width();
						},

						get height() {
							return height();
						},
						depth: 1
					});
				};

				Box(node_3, {
					width: 'auto',
					height: 200,
					flex: 0.5,
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