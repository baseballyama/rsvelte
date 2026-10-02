import * as $ from 'svelte/internal/server';
import { sprites } from './sprites.js';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div><svg width="13" height="14" aria-hidden="true"><use${$.attr('xlink:href', `${$.stringify(sprites['a'])}#done`)}></use></svg></div>`);
	});
}