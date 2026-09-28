import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Flex, Box, tailwindParser } from '@threlte/flex';
import Plane from '../../Plane.svelte';

var root = $.from_html(`<!> <!>`, 1);

export default function Threlte($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Plane(node, { width: 300, height: 300, color: 'red' });

	var node_1 = $.sibling(node, 2);

	Flex(node_1, {
		width: 300,
		height: 300,
		get classParser() {
			return tailwindParser;
		},
		class: 'gap-10 p-10',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			{
				const children = ($$anchor, $$arg0) => {
					let width = () => ($$arg0?.()).width;
					let height = () => ($$arg0?.()).height;

					Plane($$anchor, {
						get width() {
							return width();
						},

						get height() {
							return height();
						},
						color: 'yellow',
						depth: 1
					});
				};

				Box(node_2, { class: 'h-44 w-44', children, $$slots: { default: true } });
			}

			var node_3 = $.sibling(node_2, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let width = () => ($$arg0?.()).width;

					Plane($$anchor, {
						color: 'blue',
						get width() {
							return width();
						},
						height: 44,
						depth: 1
					});
				};

				Box(node_3, { class: 'flex-1', children, $$slots: { default: true } });
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}