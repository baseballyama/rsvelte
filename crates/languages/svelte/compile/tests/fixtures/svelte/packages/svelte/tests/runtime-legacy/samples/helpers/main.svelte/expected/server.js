import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	function reverse(str) {
		let reversed = '';
		let i = str.length;

		while (i--) reversed += str[i];

		return reversed;
	}

	$$renderer.push(`<p>${$.escape(reverse('backwards'))}</p>`);
}