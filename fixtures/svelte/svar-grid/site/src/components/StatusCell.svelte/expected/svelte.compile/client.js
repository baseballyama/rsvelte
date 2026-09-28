import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import StatusStub from "./StatusStub.svelte";
import { getData } from "../data/index";

export default function StatusCell($$anchor, $$props) {
	$.push($$props, true);

	const statuses = getData().statuses;
	let status = $.derived(() => statuses.find((st) => st.id === $$props.row[$$props.column.id]));

	StatusStub($$anchor, {
		get data() {
			return $.get(status);
		}
	});

	$.pop();
}