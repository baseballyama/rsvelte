import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const thing = {};

	$.head('1obi4vh', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>${$.escape(thing.thing)}</title>`);
		});
	});
}