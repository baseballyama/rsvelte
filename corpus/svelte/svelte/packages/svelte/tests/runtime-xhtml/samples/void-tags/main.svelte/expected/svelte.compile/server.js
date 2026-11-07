import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<area alt=""/> <base/> <br/> <col/> <embed/> <hr/> <img alt=""/> <input/> <keygen/> <link/> <meta/> <param/> <source/> <track/> <wbr/>`);
}