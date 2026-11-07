import * as $ from 'svelte/internal/server';
import { base } from '$app/paths';

export default function _page($$renderer) {
	$$renderer.push(`<img alt="Minified Size"${$.attr('src', `${$.stringify(base)}/minified-size-badge.svg`)}/> <p>The badge above shows the minimized size of the library when all features are used. <br/> Please note, the size includes type definitions, styles and components.</p>`);
}