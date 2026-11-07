import * as $ from 'svelte/internal/server';

export default function Preset_html_output($$renderer) {
	$.head('gbykey', $$renderer, ($$renderer) => {});
	$$renderer.push(`<div><div></div> <img/> `);
	TestComponent($$renderer, {});
	$$renderer.push(`<!----> <svg><path></path></svg> <math><msup></msup></math></div>`);
}