import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Table, Button } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Dynamic($$anchor) {
	let items = [
		{ id: 1, maker: "Toyota", type: "ABC", make: 2017 },
		{ id: 2, maker: "Ford", type: "CDE", make: 2018 },
		{ id: 3, maker: "Volvo", type: "FGH", make: 2019 },
		{ id: 4, maker: "Saab", type: "IJK", make: 2020 }
	];

	let items2 = [
		{ id: 5, maker: "Nissan", type: "LMN", make: 2019 },
		{ id: 6, maker: "VW", type: "OPQ", make: 2020 },
		{ id: 7, maker: "Honda", type: "RST", make: 2021 },
		{ id: 8, maker: "Audi", type: "UVW", make: 2023 }
	];

	let carList = $.state($.proxy(items));

	const changeItems = () => {
		$.set(carList, $.get(carList)[0].id === items[0].id ? items2 : items, true);
	};

	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		onclick: changeItems,
		class: 'mb-4',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Change data');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Table(node_1, {
		get items() {
			return $.get(carList);
		},
		hoverable: true
	});

	$.append($$anchor, fragment);
}