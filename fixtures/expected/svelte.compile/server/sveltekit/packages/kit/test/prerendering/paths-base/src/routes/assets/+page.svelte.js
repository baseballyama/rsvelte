import * as $ from 'svelte/internal/server';
import logo from './logo.svg';

export default function _page($$renderer) {
	$$renderer.push(`<img${$.attr('src', logo)} alt="Svelte logo"/>`);
}