import * as $ from 'svelte/internal/server';
import Component1 from "./find-component-references-child.svelte";

export default function Find_component_references_parent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		test();

		const theModule2 = import("./find-component-references-child.svelte");

		import("./find-component-references-child.svelte").then((module) => {
			new module.default({ target: document.body });
		});

		async function test() {
			const theModule = await import("./find-component-references-child.svelte");
		}

		Component1($$renderer, {});
		$$renderer.push(`<!----> `);

		Component1($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<p>test</p> <p>test</p>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}