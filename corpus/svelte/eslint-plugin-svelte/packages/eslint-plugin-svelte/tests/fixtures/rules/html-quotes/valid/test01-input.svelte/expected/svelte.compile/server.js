import * as $ from 'svelte/internal/server';

export default function Test01_input($$renderer) {
	let text = '';
	let value = '';
	let src = 'tutorial/image.gif';
	let name = 'Rick Astley';

	$$renderer.push(`<input type="text"${$.attr('value', text)}/> <input type="text"${$.attr('value', value)}/> <input type="text"${$.attr('value', value)}/> <img${$.attr('src', src)} alt="Rick Astley dances."/> <img${$.attr('src', src)} alt="Rick Astley dances."/> <img${$.attr('src', src)} alt="Rick Astley dances."/> <img${$.attr('src', src === 'foo' ? 'a' : 'b')} alt="Rick Astley dances."/>`);
}