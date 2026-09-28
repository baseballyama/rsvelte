import * as $ from 'svelte/internal/server';
import AllTypes from '$doclib/examples/AllTypes.svelte';

export default function _page($$renderer) {
	let color = '#ffffff';
	let overrides = { background: '#000000', fg: '#FFFFFF' };

	$$renderer.push(`<div class="flex"><label>text color <input type="color"${$.attr(
		'value',
		// let backgroundColor = $state('transparent')
		color
	)}/></label> <label>bg <input type="color"${$.attr('value', overrides.background)}/></label> <label>fg <input type="color"${$.attr('value', overrides.fg)}/></label></div> <div${$.attr_style(`color: ${$.stringify(color)};padding: 2em;`)}>`);

	AllTypes($$renderer, { theme: 'plain' });

	$$renderer.push(`<!----></div> --text-search-highlight-color="hotpink" --text-search-highlight-fg-color="black"
--text-search-highlight-decoration="underline dotted black" --text-search-highlight-border="1px
dotted green"`);
}