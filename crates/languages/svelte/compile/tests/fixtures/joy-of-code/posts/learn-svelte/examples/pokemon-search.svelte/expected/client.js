import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getAbortSignal } from 'svelte';

var root = $.from_html(`<div class="container"><div><input type="search" placeholder="Enter Pokemon name" class="svelte-m5x4cx"/> <img class="svelte-m5x4cx"/></div></div>`);

export default function Pokemon_search($$anchor, $$props) {
	$.push($$props, true);

	let pokemon = $.state('charizard');
	let image = $.state('');

	async function getPokemon(pokemon) {
		const baseUrl = 'https://pokeapi.co/api/v2/pokemon';
		const response = await fetch(`${baseUrl}/${pokemon}`, { signal: getAbortSignal() });

		if (!response.ok) throw new Error('💣️ oops!');

		return response.json();
	}

	$.user_effect(() => {
		getPokemon($.get(pokemon)).then((data) => {
			$.set(image, data.sprites.front_default, true);
		});
	});

	var div = root();
	var div_1 = $.child(div);
	var input = $.child(div_1);
	var img = $.sibling(input, 2);

	$.reset(div_1);
	$.reset(div);

	$.template_effect(() => {
		$.set_attribute(img, 'src', $.get(image));
		$.set_attribute(img, 'alt', $.get(pokemon));
	});

	$.delegated('input', input, (e) => $.set(pokemon, e.target.value, true));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['input']);