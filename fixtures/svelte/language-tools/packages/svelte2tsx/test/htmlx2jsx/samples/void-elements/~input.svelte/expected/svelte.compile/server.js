import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<area/> <base/> <br/> <col/> <embed/> <hr/> <img/> <input/> <link/> <meta/> <param/> <source/> <track/> <wbr/>`);
}