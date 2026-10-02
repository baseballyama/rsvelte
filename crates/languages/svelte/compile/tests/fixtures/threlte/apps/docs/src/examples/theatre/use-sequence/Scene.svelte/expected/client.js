import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { T } from '@threlte/core';
import { Environment, Text, interactivity } from '@threlte/extras';
import { useSequence } from '@threlte/theatre';
import Feather from './Feather.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Scene($$anchor, $$props) {
	$.push($$props, true);

	const $position = () => $.store_get(position, '$position', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();

	interactivity();

	const { position, config, play } = useSequence();

	// adjust playback settings
	config({ iterationCount: Infinity, rate: 0.3 });

	const format = (num) => num.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
	let time = $.derived(() => format($position()));

	play();

	var fragment = root();
	var node = $.first_child(fragment);

	Feather(node, {});

	var node_1 = $.sibling(node, 2);

	Text(node_1, {
		'position.x': 1,
		get text() {
			return $.get(time);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	$.component(node_2, () => T.PerspectiveCamera, ($$anchor, T_PerspectiveCamera) => {
		T_PerspectiveCamera($$anchor, { 'position.z': 2, makeDefault: true });
	});

	var node_3 = $.sibling(node_2, 2);

	$.component(node_3, () => T.AmbientLight, ($$anchor, T_AmbientLight) => {
		T_AmbientLight($$anchor, { intensity: 0.2 });
	});

	var node_4 = $.sibling(node_3, 2);

	Environment(node_4, {
		url: '/textures/equirectangular/hdr/industrial_sunset_puresky_1k.hdr',
		isBackground: true
	});

	$.append($$anchor, fragment);
	$.pop();
	$$cleanup();
}