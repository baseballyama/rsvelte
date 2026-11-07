import * as $ from 'svelte/internal/server';
import { getAbortSignal } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

export default function Reactive_map($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let name = '';
		const pokemon = new SvelteMap();

		async function getPokemon() {
			if (!name || pokemon.has(name)) return;

			const baseUrl = 'https://pokeapi.co/api/v2/pokemon';
			const response = await fetch(`${baseUrl}/${name}`, { signal: getAbortSignal() });

			if (!response.ok) throw new Error('💣️ oops!');

			const data = await response.json();

			pokemon.set(name, data);
		}

		$$renderer.push(`<div class="container svelte-2hwqol"><div${$.attr_style('', { width: '400px' })}><input type="search"${$.attr('value', name)} placeholder="Enter Pokemon name" class="svelte-2hwqol"/> <div class="pokemon"><!--[-->`);

		const each_array = $.ensure_array_like(pokemon);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [name, details] = each_array[$$index];

			$$renderer.push(`<details class="svelte-2hwqol"><summary class="svelte-2hwqol">${$.escape(name)}</summary> <div class="data svelte-2hwqol"><pre>${$.escape(JSON.stringify(details, null, 2))}</pre></div></details>`);
		}

		$$renderer.push(`<!--]--></div> <button class="svelte-2hwqol">🧹 Clear</button></div></div>`);
	});
}