import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<img src="foo.jpg"/> <map><area/></map> <object></object> <input type="image"/> <input type="image" alt="hey"/>`);
}