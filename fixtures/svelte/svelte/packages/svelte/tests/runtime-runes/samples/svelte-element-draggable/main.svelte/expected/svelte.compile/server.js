import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let attrs = { draggable: 'false' };

	$.element($$renderer, 'div', () => {
		$$renderer.push(` draggable="false"`);
	});

	$$renderer.push(` <div${$.attributes({ ...attrs })}></div>`);
}