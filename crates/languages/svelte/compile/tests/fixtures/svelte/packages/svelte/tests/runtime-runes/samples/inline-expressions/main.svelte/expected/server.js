import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<p>Without text expression: 7.36</p> <p>With text expression: 7.36</p> <p>With text expression and function call: ${$.escape((7.36).toString())}</p> <p>With text expression and property access: ${$.escape(("test").length)}</p> <h1>Hello ${$.escape(('name').toUpperCase().toLowerCase())}!</h1> <p>${$.escape(("test").length)}</p> <h1>Tracking: ${$.escape(false)}</h1>`);
	});
}