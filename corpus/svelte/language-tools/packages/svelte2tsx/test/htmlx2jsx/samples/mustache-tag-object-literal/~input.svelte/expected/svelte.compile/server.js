import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<!---->${$.escape({
			toString() {
				return "Hello World";
			}
		})}

${$.escape(({ a: '' })['a'])}`);
	});
}