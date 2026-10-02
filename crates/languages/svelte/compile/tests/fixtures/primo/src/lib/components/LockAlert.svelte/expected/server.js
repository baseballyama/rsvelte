import * as $ from 'svelte/internal/server';

export default function LockAlert($$renderer, $$props) {
	let { email } = $$props;

	$$renderer.push(`<div class="container svelte-1mobw5b"><div class="content svelte-1mobw5b">this site is locked because it's being edited by <strong>${$.escape(email)}</strong></div> <div class="buttons svelte-1mobw5b"><button class="button outlined svelte-1mobw5b">Try again</button> <a href="/" class="button svelte-1mobw5b">Back to Dashboard</a></div></div>`);
}