import * as $ from 'svelte/internal/server';
import { Table } from "@flowbite-svelte-plugins/datatable";
import products from "./data/products.json";

export default function Scrolly($$renderer) {
	const scrollyOptions = {
		paging: false,
		scrollY: "30vh",
		rowNavigation: true,
		tabIndex: 1
	};

	Table($$renderer, { items: products, dataTableOptions: scrollyOptions });
}