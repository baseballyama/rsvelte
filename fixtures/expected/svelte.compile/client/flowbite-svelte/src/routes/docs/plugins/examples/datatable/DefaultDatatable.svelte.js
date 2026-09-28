import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Table } from "@flowbite-svelte-plugins/datatable";
import items from "./data/sample.json";

export default function DefaultDatatable($$anchor) {
	Table($$anchor, {
		get items() {
			return items;
		}
	});
}