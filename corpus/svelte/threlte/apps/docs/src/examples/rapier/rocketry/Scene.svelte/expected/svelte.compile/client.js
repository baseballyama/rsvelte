import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PortalTarget, Stars } from '@threlte/extras';
import Level from './Level.svelte';
import { level1, level2 } from './levels/levels';
import { useThrelte } from '@threlte/core';
import { Color } from 'three';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const levels = [level1, level2];
	let currentLevelIndex = $.state(0);
	const level = $.derived(() => levels[$.get(currentLevelIndex)]);

	const nextLevel = () => {
		if ($.get(currentLevelIndex) < levels.length - 1) {
			$.set(currentLevelIndex, $.get(currentLevelIndex) + 1);
		}
	};

	const { scene } = useThrelte();

	scene.background = new Color('black');

	var fragment = root();
	var node = $.first_child(fragment);

	PortalTarget(node, { id: 'scene' });

	var node_1 = $.sibling(node, 2);

	$.key(node_1, () => $.get(currentLevelIndex), ($$anchor) => {
		var fragment_1 = $.comment();
		var node_2 = $.first_child(fragment_1);

		{
			var consequent = ($$anchor) => {
				Level($$anchor, {
					get level() {
						return $.get(level);
					},
					levelcomplete: nextLevel
				});
			};

			$.if(node_2, ($$render) => {
				if ($.get(level)) $$render(consequent);
			});
		}

		$.append($$anchor, fragment_1);
	});

	var node_3 = $.sibling(node_1, 2);

	Stars(node_3, {});
	$.append($$anchor, fragment);
	$.pop();
}