import * as $ from 'svelte/internal/server';

export default function Dynamic_attributes_input($$renderer) {
	let src = 'tutorial/image.gif';

	$$renderer.push(`<img/> <img${$.attr('src', src)}/> <img${$.attr('src', src)} alt="A man dances."/> <img${$.attr('src', src)} alt="A man dances."/>`);
}