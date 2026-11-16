import * as $ from "svelte/internal/server";
export default function Mustache_statements($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let a = 1;
		$$renderer.push(`<!---->${$.escape({ a: 1 })}
${$.escape({ a }.a)}
${$.escape((a, a))}
${$.escape(function() {})}`);
	});
}
