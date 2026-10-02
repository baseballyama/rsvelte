import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const userdata = {
		ONCLICK: 'alert(document.cookie)',
		ONMOUSEOVER: 'alert("XSS")'
	};

	$$renderer.push(`<svg${$.attributes({ ...userdata }, void 0, void 0, void 0, 3)}><circle cx="12" cy="12" r="10"></circle></svg> <math${$.attributes({ ...userdata }, void 0, void 0, void 0, 3)}><mi>x</mi></math> <custom-element${$.attributes({ ...userdata }, void 0, void 0, void 0, 2)}></custom-element>`);
}