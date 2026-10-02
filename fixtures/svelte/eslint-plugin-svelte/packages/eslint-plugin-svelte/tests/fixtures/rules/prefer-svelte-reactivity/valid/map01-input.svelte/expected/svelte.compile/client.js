import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Map01_input($$anchor, $$props) {
	$.push($$props, true);

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
	$.next();

	var text = $.text();

	$.template_effect(() => $.set_text(text, variable));
	$.append($$anchor, text);
	$.pop();
}