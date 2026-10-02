import * as $ from 'svelte/internal/server';

export default function Class01_input($$renderer) {
	$$renderer.push(`<a class="link svelte-1cg92pd">Click me!</a> <a class="link svelte-1cg92pd">Click me two!</a> <b class="bold svelte-1cg92pd">Text 1</b> <b class="bold svelte-1cg92pd">Text 2</b> <b data-key="val">Text 2</b> <b${$.attr_class('svelte-1cg92pd', void 0, { 'conditional': true })}>Text 3</b> <!--[-->`);

	const each_array = $.ensure_array_like(["one", "two"]);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let iter = each_array[$$index];

		$$renderer.push(`<span class="iterated-each svelte-1cg92pd">${$.escape(iter)}</span>`);
	}

	$$renderer.push(`<!--]--> `);

	CustomComponent($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<span class="iterated-component svelte-1cg92pd">Text 5</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}