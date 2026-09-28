import * as $ from 'svelte/internal/server';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { move } from './index';

export default function Use_move_stories($$renderer) {
	let moving = false;
	let position = { x: 0, y: 0 };

	function handleMoveStart() {
		moving = true;
	}

	function handleMove(event) {
		position = event.detail;
	}

	function handleMoveStop() {
		moving = false;
	}

	Meta($$renderer, { title: 'Composables/use-move' });
	$$renderer.push(`<!----> `);

	Template($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { args }) => {
				$$renderer.push(`<div style="position: relative; width: 90%; height: 80vh; background-color: lightgrey; margin: 40px;"><div${$.attr_style(`position: absolute; cursor: pointer; background-color: ${moving ? 'green' : 'red'}; width: 80px; height: 80px; left: calc(${$.stringify(position.x * 100)}% - 40px); top: calc(${$.stringify(position.y * 100)}% - 40px);`)}></div></div> <div style="text-align: center; margin-top: 10px;">X: ${$.escape(position.x * 100)}% Y: ${$.escape(position.y * 100)}%</div>`);
			}
		}
	});

	$$renderer.push(`<!----> `);
	Story($$renderer, { name: 'use-move', id: 'useMoveStory' });
	$$renderer.push(`<!---->`);
}