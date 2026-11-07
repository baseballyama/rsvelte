import * as $ from 'svelte/internal/server';
import Info from './Info.svelte';

export default function Spread_props01_input($$renderer) {
	const pkg = {
		name: 'svelte',
		version: 3,
		speed: 'blazing',
		website: 'https://svelte.dev'
	};

	Info($$renderer, {
		name: pkg.name,
		version: pkg.version,
		speed: pkg.speed,
		website: pkg.website
	});
}