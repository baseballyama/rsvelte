import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
	$$renderer.push(`<div></div> <div title="preserve"></div> <input type="text"/> <hr/> <f:table></f:table>`);
}