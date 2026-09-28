import * as $ from 'svelte/internal/server';
import { useGamepad } from '../lib/index.js';

export default function MountedGamepad($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		const gamepad = useGamepad();
		const { connected } = gamepad;

		const onPress = () => {
			console.log('pressed');
		};

		gamepad.on('press', onPress);
		console.log('mounted!');

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}