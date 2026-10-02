import * as $ from 'svelte/internal/server';

export default function Template01_input($$renderer) {
	let name = 'World';

	$$renderer.push(`<h1 class="svelte-1mujqbb">Hello World</h1> <p>Line 1</p> <p>Line 2</p> <p>Line 3</p> <p>Line 4</p> <p>Line 5</p> <p>Line 6</p>`);
}