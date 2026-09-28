import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	let { style } = $$props;

	$$renderer.push(`<div${$.attr_style(style)}></div> <div${$.attributes({ ...{ style } })}></div> <custom-element${$.attr_style(style)}></custom-element> <custom-element${$.attributes({ ...{ style } }, void 0, void 0, void 0, 2)}></custom-element>`);
}