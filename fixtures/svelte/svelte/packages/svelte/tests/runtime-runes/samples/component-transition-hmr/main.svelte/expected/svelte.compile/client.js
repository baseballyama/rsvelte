import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Red from "./Red.svelte";
import Blue from "./Blue.svelte";

var root = $.from_html(`<main><button>toggle</button> <!></main>`);

export default function Main($$anchor) {
	const comps = { Red, Blue };
	let activeComp = $.state("Red");
	var main = root();
	var button = $.child(main);
	var node = $.sibling(button, 2);

	$.component(node, () => comps[$.get(activeComp)], ($$anchor, $$component) => {
		$$component($$anchor, {});
	});

	$.reset(main);
	$.delegated('click', button, () => $.set(activeComp, $.get(activeComp) === "Red" ? "Blue" : "Red", true));
	$.append($$anchor, main);
}

$.delegate(['click']);