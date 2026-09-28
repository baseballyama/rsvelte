import * as $ from 'svelte/internal/server';
import { Table, Button } from "flowbite-svelte";

export default function Dynamic($$renderer) {
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

	let carList = items;

	const changeItems = () => {
		carList = carList[0].id === items[0].id ? items2 : items;
	};

	Button($$renderer, {
		onclick: changeItems,
		class: 'mb-4',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Change data`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);
	Table($$renderer, { items: carList, hoverable: true });
	$$renderer.push(`<!---->`);
}