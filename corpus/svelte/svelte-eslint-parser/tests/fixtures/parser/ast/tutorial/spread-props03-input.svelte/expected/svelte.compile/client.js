import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Info from './Info.svelte';

export default function Spread_props03_input($$anchor) {
	const pkg = {
		name: 'svelte',
		version: 3,
		speed: 'blazing',
		website: 'https://svelte.dev'
	};

	Info($$anchor, $.spread_props(() => pkg));
}