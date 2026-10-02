import * as $ from 'svelte/internal/server';

export default function Importcompletions_text($$renderer) {
	let abc = "";

	$$renderer.push(`<!---->a <div>a
a</div> <div></div> `);

	Comp($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->a
a`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Comp($$renderer, {});
	$$renderer.push(`<!---->`);
}