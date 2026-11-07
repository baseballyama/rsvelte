import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$.element($$renderer, "title", void 0, () => {
		$$renderer.push(`lorem`);
	});

	$$renderer.push(` `);

	$.element($$renderer, "style", void 0, () => {
		$$renderer.push(`.ipsum { display: block; }`);
	});

	$$renderer.push(` `);

	$.element($$renderer, "script", void 0, () => {
		$$renderer.push(`console.log(true);`);
	});
}