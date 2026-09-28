import * as $ from 'svelte/internal/server';
import { Box, Flex, createClassParser } from '@threlte/flex';
import RoundedPlane from './RoundedPlane.svelte';

export default function Scene($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
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

		Flex($$renderer, {
			width: 300,
			height: 150,
			classParser,
			class: 'container',
			children: ($$renderer) => {
				RoundedPlane($$renderer, { radius: 15, color: '#FE3D00', width: 300, height: 150 });
				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { width, height }) {
						RoundedPlane($$renderer, { color: '#EB1688', width, height, depth: 1 });
					}

					Box($$renderer, { class: 'item', children, $$slots: { default: true } });
				}

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { width, height }) {
						RoundedPlane($$renderer, { color: '#113BFA', width, height, depth: 1 });
					}

					Box($$renderer, { class: 'item', children, $$slots: { default: true } });
				}

				$$renderer.push(`<!----> `);

				{
					function children($$renderer, { width, height }) {
						RoundedPlane($$renderer, { color: '#590C65', width, height, depth: 1 });
					}

					Box($$renderer, { class: 'item', children, $$slots: { default: true } });
				}

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}