import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PokemonCard from "./components/pokemon-card.svelte";
import { getPokemonList } from "./lib/pokemon.js";

var root = $.from_html(`<div class="mx-auto w-full max-w-2xl px-4"><div class="grid grid-cols-2 gap-4 py-10 sm:grid-cols-3 md:grid-cols-4"></div></div>`);
var root_1 = $.from_html(`<div class="mx-auto w-full max-w-2xl px-4"><p>Error loading pokemons</p></div>`);
var root_2 = $.from_html(`<div>Loading pokemons...</div>`);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => getPokemonList({ limit: 12 }),
		($$anchor) => {
			var div_3 = root_2();

			$.append($$anchor, div_3);
		},
		($$anchor, pokemons) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var div = root();
					var div_1 = $.child(div);

					$.each(div_1, 21, () => $.get(pokemons).results, (pokemon) => pokemon.name, ($$anchor, pokemon) => {
						PokemonCard($$anchor, {
							get name() {
								return $.get(pokemon).name;
							}
						});
					});

					$.reset(div_1);
					$.reset(div);
					$.append($$anchor, div);
				};

				$.if(node_1, ($$render) => {
					if ($.get(pokemons)) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		},
		($$anchor) => {
			var div_2 = root_1();

			$.append($$anchor, div_2);
		}
	);

	$.append($$anchor, fragment);
	$.pop();
}