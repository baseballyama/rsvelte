import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let message = 'hello';

	Child($$renderer, {
		message,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { message }) => {
				$$renderer.push(`<p>message: ${$.escape(message)}</p>`);
			}
		}
	});
}