import * as $ from 'svelte/internal/server';

export default function Boundaries_input($$renderer) {
	let foo = 'foo';

	$$renderer.push(`<div data-text="prefix foofoo suffix"></div> <div${$.attr('data-text', foo ? `foo${foo}` : 'bar')}></div> <div${$.attr('data-text', `prefix${/* comment */ foo}`)}></div> <div${$.attr('data-text', `line\n${foo}`)}></div> <div${$.attr('data-text', `prefix{${foo}`)}></div> <div${$.attr_style('', { color: `rgb(${foo})` })}></div> <div${$.attr('data-text', 'prefix' + foo)}></div> <div${$.attr('data-text', `static`)}></div> `);

	HyperMD($$renderer, {
		value: `# ${foo}

Text goes here`
	});

	$$renderer.push(`<!---->`);
}