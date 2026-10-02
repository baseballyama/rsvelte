import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getAbortSignal } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

var root = $.from_html(`<details class="svelte-2hwqol"><summary class="svelte-2hwqol"> </summary> <div class="data svelte-2hwqol"><pre> </pre></div></details>`);
var root_1 = $.from_html(`<div class="container svelte-2hwqol"><div><input type="search" placeholder="Enter Pokemon name" class="svelte-2hwqol"/> <div class="pokemon"></div> <button class="svelte-2hwqol">🧹 Clear</button></div></div>`);

export default function Reactive_map($$anchor, $$props) {
	$.push($$props, true);

	let name = $.state('');
	const pokemon = new SvelteMap();

	async function getPokemon() {
		if (!$.get(name) || pokemon.has($.get(name))) return;

		const baseUrl = 'https://pokeapi.co/api/v2/pokemon';
		const response = await fetch(`${baseUrl}/${$.get(name)}`, { signal: getAbortSignal() });

		if (!response.ok) throw new Error('💣️ oops!');

		const data = await response.json();

		pokemon.set($.get(name), data);
	}

	$.user_effect(() => {
		getPokemon();
	});

	var div = root_1();
	var div_1 = $.child(div);

	$.set_style(div_1, '', {}, { width: '400px' });

	var input = $.child(div_1);

	$.remove_input_defaults(input);

	var div_2 = $.sibling(input, 2);

	$.each(div_2, 21, () => pokemon, $.index, ($$anchor, $$item, $$index, $$array) => {
		var $$array_1 = $.derived(() => $.to_array($.get($$item), 2));
		let name = () => $.get($$array_1)[0];
		let details = () => $.get($$array_1)[1];
		var details_1 = root();
		var summary = $.child(details_1);
		var text = $.only_child(summary, true);
		var div_3 = $.sibling(summary, 2);
		var pre = $.child(div_3);
		var text_1 = $.only_child(pre, true);

		$.reset(div_3);
		$.reset(details_1);

		$.template_effect(
			($0) => {
				$.set_text(text, name());
				$.set_text(text_1, $0);
			},
			[() => JSON.stringify(details(), null, 2)]
		);

		$.append($$anchor, details_1);
	});

	$.reset(div_2);

	var button = $.sibling(div_2, 2);

	$.reset(div_1);
	$.reset(div);
	$.bind_value(input, () => $.get(name), ($$value) => $.set(name, $$value));
	$.delegated('click', button, () => pokemon.clear());
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);