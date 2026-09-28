import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Meta, Template, Story } from '@storybook/addon-svelte-csf';
import { move } from './index';

var root = $.from_html(`<div style="position: relative; width: 90%; height: 80vh; background-color: lightgrey; margin: 40px;"><div></div></div> <div style="text-align: center; margin-top: 10px;"> </div>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function Use_move_stories($$anchor) {
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

	var fragment = root_1();
	var node = $.first_child(fragment);

	Meta(node, { title: 'Composables/use-move' });

	var node_1 = $.sibling(node, 2);

	Template(node_1, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$anchor, $$slotProps) => {
				const args = $.derived(() => $$slotProps.args);
				var fragment_1 = root();
				var div = $.first_child(fragment_1);
				var div_1 = $.only_child(div);

				$.action(div, ($$node) => move?.($$node));
				$.effect(() => $.event('move:start', div, handleMoveStart));
				$.effect(() => $.event('move', div, handleMove));
				$.effect(() => $.event('move:stop', div, handleMoveStop));

				var div_2 = $.sibling(div, 2);
				var text = $.only_child(div_2);

				$.template_effect(() => {
					$.set_style(div_1, `position: absolute; cursor: pointer; background-color: ${moving ? 'green' : 'red'}; width: 80px; height: 80px; left: calc(${position.x * 100}% - 40px); top: calc(${position.y * 100}% - 40px);`);
					$.set_text(text, `X: ${position.x * 100}% Y: ${position.y * 100}%`);
				});

				$.append($$anchor, fragment_1);
			}
		}
	});

	var node_2 = $.sibling(node_1, 2);

	Story(node_2, { name: 'use-move', id: 'useMoveStory' });
	$.append($$anchor, fragment);
}