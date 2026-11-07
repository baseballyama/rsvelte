import * as $ from 'svelte/internal/server';

export default function Preset_none_input($$renderer) {
	$.head('1k7tsrz', $$renderer, ($$renderer) => {});
	$$renderer.push(`<div><div></div> `);
	TestComponent($$renderer, {});
	$$renderer.push(`<!----> <img/> <svg><path></path></svg> <math><msup></msup></math></div>`);
}