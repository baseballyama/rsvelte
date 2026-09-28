import * as $ from 'svelte/internal/server';
import StatusStub from "./StatusStub.svelte";
import { getData } from "../data/index";

export default function StatusCell($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { row, column } = $$props;
		const statuses = getData().statuses;
		let status = $.derived(() => statuses.find((st) => st.id === row[column.id]));

		StatusStub($$renderer, { data: status() });
	});
}