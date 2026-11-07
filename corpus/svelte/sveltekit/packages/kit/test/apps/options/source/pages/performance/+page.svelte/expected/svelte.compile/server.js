import * as $ from 'svelte/internal/server';
import Image from './icon.svg?no-inline';

export default function _page($$renderer) {
	$$renderer.push(`<p>this app has paths.assets set so it should not use relative paths for imported assets in the
	client code</p> <img${$.attr('src', Image)} alt="svelte logo"/>`);
}