import * as $ from 'svelte/internal/server';
import DatePicker from "components/DatePicker";
import Code from "docs/Code.svelte";
import datepickers from "examples/date-pickers.txt";

export default function Date_pickers($$renderer) {
	let selected;

	$$renderer.push(`<div><small>I selected ${$.escape(selected ? selected.toLocaleDateString() : "nothing")}</small></div> `);
	DatePicker($$renderer, {});
	$$renderer.push(`<!----> `);
	Code($$renderer, { code: datepickers });
	$$renderer.push(`<!---->`);
}