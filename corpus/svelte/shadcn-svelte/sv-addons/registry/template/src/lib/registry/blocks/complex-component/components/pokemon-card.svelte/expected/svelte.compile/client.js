import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getPokemon } from "$lib/registry/blocks/complex-component/lib/pokemon.js";
import * as Card from "$lib/registry/ui/card/index.js";
import PokemonImage from "$lib/registry/blocks/complex-component/components/pokemon-image.svelte";

var root = $.from_html(`<div><!></div> <div class="text-center font-medium"> </div>`, 1);
var root_1 = $.from_html(`<div>Error loading pokemon</div>`);
var root_2 = $.from_html(`<div>Loading...</div>`);

export default function Pokemon_card($$anchor, $$props) {
	$.push($$props, true);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(
		node,
		() => getPokemon($$props.name),
		($$anchor) => {
			var div_3 = root_2();

			$.append($$anchor, div_3);
		},
		($$anchor, pokemon) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = $.comment();
					var node_2 = $.first_child(fragment_2);

					$.component(node_2, () => Card.Root, ($$anchor, Card_Root) => {
						Card_Root($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_3 = $.comment();
								var node_3 = $.first_child(fragment_3);

								$.component(node_3, () => Card.Content, ($$anchor, Card_Content) => {
									Card_Content($$anchor, {
										class: 'flex flex-col items-center p-2',
										children: ($$anchor, $$slotProps) => {
											var fragment_4 = root();
											var div = $.first_child(fragment_4);
											var node_4 = $.child(div);

											PokemonImage(node_4, {
												get name() {
													return $.get(pokemon).name;
												},

												get number() {
													return $.get(pokemon).id;
												}
											});

											$.reset(div);

											var div_1 = $.sibling(div, 2);
											var text = $.only_child(div_1, true);

											$.template_effect(() => $.set_text(text, $.get(pokemon).name));
											$.append($$anchor, fragment_4);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_3);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_2);
				};

				$.if(node_1, ($$render) => {
					if ($.get(pokemon)) $$render(consequent);
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