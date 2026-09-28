import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Box, Flex, createClassParser } from '@threlte/flex';
import RoundedPlane from './RoundedPlane.svelte';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const classParser = createClassParser((string, props) => {
		const classNames = string.split(' ');

		for (const className of classNames) {
			switch (className) {
				case 'container':
					props.flexDirection = 'Row';
					props.justifyContent = 'Center';
					props.alignItems = 'Stretch';
					props.gap = 10;
					props.padding = 10;
					break;

				case 'item':
					props.width = 'auto';
					props.height = 'auto';
					props.flex = 1;
			}
		}

		return props;
	});

	Flex($$anchor, {
		width: 300,
		height: 150,
		get classParser() {
			return classParser;
		},
		class: 'container',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			RoundedPlane(node, { radius: 15, color: '#FE3D00', width: 300, height: 150 });

			var node_1 = $.sibling(node, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let width = () => ($$arg0?.()).width;
					let height = () => ($$arg0?.()).height;

					RoundedPlane($$anchor, {
						color: '#EB1688',
						get width() {
							return width();
						},

						get height() {
							return height();
						},
						depth: 1
					});
				};

				Box(node_1, { class: 'item', children, $$slots: { default: true } });
			}

			var node_2 = $.sibling(node_1, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let width = () => ($$arg0?.()).width;
					let height = () => ($$arg0?.()).height;

					RoundedPlane($$anchor, {
						color: '#113BFA',
						get width() {
							return width();
						},

						get height() {
							return height();
						},
						depth: 1
					});
				};

				Box(node_2, { class: 'item', children, $$slots: { default: true } });
			}

			var node_3 = $.sibling(node_2, 2);

			{
				const children = ($$anchor, $$arg0) => {
					let width = () => ($$arg0?.()).width;
					let height = () => ($$arg0?.()).height;

					RoundedPlane($$anchor, {
						color: '#590C65',
						get width() {
							return width();
						},

						get height() {
							return height();
						},
						depth: 1
					});
				};

				Box(node_3, { class: 'item', children, $$slots: { default: true } });
			}

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}