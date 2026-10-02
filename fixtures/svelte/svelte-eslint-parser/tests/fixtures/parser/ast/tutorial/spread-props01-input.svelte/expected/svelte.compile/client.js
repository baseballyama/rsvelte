import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Info from './Info.svelte';

export default function Spread_props01_input($$anchor) {
	const pkg = {
		name: 'svelte',
		version: 3,
		speed: 'blazing',
		website: 'https://svelte.dev'
	};

	Info($$anchor, {
		get name() {
			return pkg.name;
		},

		get version() {
			return pkg.version;
		},

		get speed() {
			return pkg.speed;
		},

		get website() {
			return pkg.website;
		}
	});
}