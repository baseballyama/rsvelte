import * as $ from 'svelte/internal/server';
import { Table } from "@flowbite-svelte-plugins/datatable";
import items from "./data/sample.json";

export default function DefaultDatatable($$renderer) {
	Table($$renderer, { items });
}