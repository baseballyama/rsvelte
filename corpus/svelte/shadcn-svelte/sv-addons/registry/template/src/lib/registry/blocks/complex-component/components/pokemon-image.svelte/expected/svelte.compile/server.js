import * as $ from 'svelte/internal/server';
import { usePokemonImage } from "$lib/registry/blocks/complex-component/hooks/use-pokemon.svelte";

export default function Pokemon_image($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { number, name } = $$props;
		const imageUrl = usePokemonImage(number);

		if (imageUrl) {
			$$renderer.push(`<!--[0--><img${$.attr('src', imageUrl)}${$.attr('alt', name)}/>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}