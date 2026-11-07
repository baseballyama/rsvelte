import * as $ from 'svelte/internal/server';
import Legacy from './Legacy.svelte';
import Runes from './Runes.svelte';

export default function Main($$renderer) {
	Legacy($$renderer, {});
	$$renderer.push(`<!----> <hr/> `);
	Runes($$renderer, {});
	$$renderer.push(`<!---->`);
}