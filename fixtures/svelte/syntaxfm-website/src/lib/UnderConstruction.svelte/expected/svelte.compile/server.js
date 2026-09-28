import * as $ from 'svelte/internal/server';
import underConstruction from '$assets/under-construction.gif';

export default function UnderConstruction($$renderer) {
	$$renderer.push(`<div class="svelte-w4jcb2"><img${$.attr('src', underConstruction)} alt="Cute lil digger on a under construction sign" class="svelte-w4jcb2"/> <p class="svelte-w4jcb2">New site, mind the dust! Please <a href="https://github.com/syntaxfm/website/issues">log any issues or suggestions</a></p></div>`);
}