import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Table } from "flowbite-svelte";

export default function Data($$anchor) {
	let items = [
		{ id: 1, maker: "Toyota", type: "ABC", make: 2017 },
		{ id: 2, maker: "Ford", type: "CDE", make: 2018 },
		{ id: 3, maker: "Volvo", type: "FGH", make: 2019 },
		{ id: 4, maker: "Saab", type: "IJK", make: 2020 }
	];

	Table($$anchor, {
		get items() {
			return items;
		},
		hoverable: true
	});
}