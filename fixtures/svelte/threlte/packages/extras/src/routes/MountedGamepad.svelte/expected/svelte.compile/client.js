import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { useGamepad } from '../lib/index.js';

export default function MountedGamepad($$anchor, $$props) {
	$.push($$props, true);

	const $connected = () => $.store_get(connected, '$connected', $$stores);
	const [$$stores, $$cleanup] = $.setup_stores();
	const gamepad = useGamepad();
	const { connected } = gamepad;

	$.user_effect(() => {
		console.log('$connected: ', $connected());
	});

	const onPress = () => {
		console.log('pressed');
	};

	gamepad.on('press', onPress);
	console.log('mounted!');
	$.pop();
	$$cleanup();
}