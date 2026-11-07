import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	Comp($$renderer, { multilineattr: 'hello\nworld' });
	$$renderer.push(`<!----> `);
	Comp($$renderer, { multilineattr: 'he`llo\nworld' });
	$$renderer.push(`<!----> `);

	Comp($$renderer, {
		multilineattr: `
color: ${$.stringify(color)}
display: block`
	});

	$$renderer.push(`<!----> <div multilineattr="hello
world"></div> <div multilineattr="he\`llo
world"></div> <div${$.attr('multilineattr', `
color: ${$.stringify(color)}
display: block`)}></div>`);
}