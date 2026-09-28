import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from '$lib/index.js';

export default function _page($$anchor) {
	// import AllTypes from '$doclib/examples/AllTypes.svelte'
	const obj = {
		name: 'Squirtle',
		pokedex: {
			no: 7,
			description: 'The shell is soft when it is born.\nIt soon becomes so resilient, prodding fingers will bounce off it.'
		},
		sprite: Promise.resolve('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png')
	};

	// const counter = new PersistedState('counter-asdfsg', 0, { syncTabs: false })
	Inspect($$anchor, {
		style: 'margin: auto; width: 600px',
		search: true,
		expandAll: true,
		embedMedia: true,
		get values() {
			return obj;
		}
	});
}