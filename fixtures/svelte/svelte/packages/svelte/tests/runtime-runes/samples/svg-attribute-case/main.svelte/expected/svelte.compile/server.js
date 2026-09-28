import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$.element($$renderer, 'svg', () => {
		$$renderer.push(` viewBox="0 0 10 10"`);
	});

	$.element($$renderer, 'svg', () => {
		$$renderer.push(` xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"`);
	});

	$$renderer.push(`<svg viewBox=""></svg>`);
}