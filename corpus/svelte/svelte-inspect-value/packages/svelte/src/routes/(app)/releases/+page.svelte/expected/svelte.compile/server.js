import * as $ from 'svelte/internal/server';
import Releases from '../../../doclib/typedoc/Releases.md';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Releases</h1> <div class="md-types">`);
	Releases($$renderer, {});
	$$renderer.push(`<!----></div>`);
}