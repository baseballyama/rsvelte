import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { usePokemonImage } from "$lib/registry/blocks/complex-component/hooks/use-pokemon.svelte";

var root = $.from_html(`<img/>`);

export default function Pokemon_image($$anchor, $$props) {
	$.push($$props, true);

	const imageUrl = usePokemonImage($$props.number);
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var img = root();

			$.template_effect(() => {
				$.set_attribute(img, 'src', imageUrl);
				$.set_attribute(img, 'alt', $$props.name);
			});

			$.append($$anchor, img);
		};

		$.if(node, ($$render) => {
			if (imageUrl) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}