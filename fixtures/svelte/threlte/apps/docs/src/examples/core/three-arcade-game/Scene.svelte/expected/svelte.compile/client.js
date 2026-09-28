import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AudioListener, interactivity } from '@threlte/extras';
import { Debug } from '@threlte/rapier';
import { AudioListener as ThreeAudioListener } from 'three';
import ArcadeScene from './arcade/Scene.svelte';
import GameScene from './game/Scene.svelte';
import { game } from './game/Game.svelte';
import { provideArcadeControls } from './game/controls.svelte';
import CustomRendering from './Renderer.svelte';

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	$.user_effect(() => {
		const intervalHandler = setInterval(
			() => {
				game.blinkClock = game.blinkClock === 0 ? 1 : 0;
			},
			96
		);

		return () => clearInterval(intervalHandler);
	});

	interactivity();
	provideArcadeControls();

	let listener = $.state(void 0);

	$.user_effect(() => {
		if ($.get(listener)) game.sound.init($.get(listener));
	});

	var fragment = root();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => game.muted ? 0 : 1);

		AudioListener(node, {
			autoResume: true,
			get masterVolume() {
				return $.get($0);
			},

			get ref() {
				return $.get(listener);
			},

			set ref($$value) {
				$.set(listener, $$value);
			}
		});
	}

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			Debug($$anchor, {});
		};

		var alternate = ($$anchor) => {
			CustomRendering($$anchor, {});
		};

		$.if(node_1, ($$render) => {
			if (game.debug) $$render(consequent); else $$render(alternate, -1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	ArcadeScene(node_2, {});

	var node_3 = $.sibling(node_2, 2);

	GameScene(node_3, {});
	$.append($$anchor, fragment);
	$.pop();
}