import * as $ from 'svelte/internal/server';

export default function Map01_input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const variable = new Map([[1, "one"], [2, "two"]]);

		console.log(Map.groupBy(variable, (element) => "group"));
		console.log(Map[Symbol.species]);
		console.log(variable.entries());

		variable.forEach((value) => {
			console.log(value);
		});

		console.log(variable.get(1));
		console.log(variable.has(1));
		console.log(variable.keys());
		console.log(variable.values());
		console.log(variable[Symbol.iterator]());
		console.log(variable.size);
		$$renderer.push(`<!---->${$.escape(variable)}`);
	});
}