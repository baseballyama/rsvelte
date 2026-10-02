import * as $ from 'svelte/internal/server';
import Inspect from '$lib/index.js';

export default function _page($$renderer) {
	// import AllTypes from '$doclib/examples/AllTypes.svelte'
	const obj = {
		name: 'Squirtle',
		pokedex: {
			no: 7,
			description: 'The shell is soft when it is born.\nIt soon becomes so resilient, prodding fingers will bounce off it.'
		},
		sprite: Promise.resolve('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png')
	};

	Inspect($$renderer, {
		style: 'margin: auto; width: 600px',
		search: true,
		expandAll: true,
		embedMedia: true,
		values: // const counter = new PersistedState('counter-asdfsg', 0, { syncTabs: false })
		obj
	});
}