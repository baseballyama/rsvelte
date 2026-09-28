import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Table } from "@flowbite-svelte-plugins/datatable";
import products from "./data/products.json";

export default function Scrolly($$anchor) {
	const scrollyOptions = {
		paging: false,
		scrollY: "30vh",
		rowNavigation: true,
		tabIndex: 1
	};

	Table($$anchor, {
		get items() {
			return products;
		},

		get dataTableOptions() {
			return scrollyOptions;
		}
	});
}