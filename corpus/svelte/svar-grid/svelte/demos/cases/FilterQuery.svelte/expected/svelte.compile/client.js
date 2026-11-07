import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import { FilterQuery, createFilter, getQueryString, getOptionsMap } from "@svar-ui/svelte-filter";
import { Grid } from "../../src";
import { getData } from "../data";

var root = $.from_html(`<div style="padding: 20px; max-width:1330px;"><h4>Filter grid data with FilterQuery in AI-powered mode</h4> <!> <p class="hint svelte-o01vfb">Type filter conditions using query syntax or natural language. Examples:</p> <ul class="examples svelte-o01vfb"><li class="svelte-o01vfb">Stars: &gt;500 and City: Eulaliabury</li> <li class="svelte-o01vfb">StartDate: &gt;= 2026-03-01</li> <li class="svelte-o01vfb">FirstName: Erick, Hubert</li> <li class="svelte-o01vfb">Started in winter</li> <li class="svelte-o01vfb">Live in Europe</li></ul> <div style="height: 600px;"><!></div></div>`);

export default function FilterQuery_1($$anchor, $$props) {
	$.push($$props, true);

	const helpers = getContext("wx-helpers");
	const { allData, allColumns, countries } = getData();
	let textValue = $.state("Country: Brasil and Email: contains yahoo");
	let api = $.state(void 0);
	let filter = $.state(void 0);

	$.user_effect(() => {
		if ($.get(api) && $.get(filter) !== undefined) $.get(api).exec("filter-rows", { filter: $.get(filter) });
	});

	let options = getOptionsMap(allData);

	function numberToCountry(n) {
		return countries.find((c) => c.id == n).label;
	}

	let fields = [
		{
			id: "country",
			label: "Country",
			type: "tuple",
			format: numberToCountry
		},
		{ id: "city", label: "City", type: "text" },
		{ id: "firstName", label: "First Name", type: "text" },
		{ id: "lastName", label: "Last Name", type: "text" },
		{ id: "email", label: "Email", type: "text" },
		{ id: "companyName", label: "Company", type: "text" },
		{ id: "stars", label: "Stars", type: "number" },
		{ id: "date", label: "Start Date", type: "date" }
	];

	async function handleFilter({ value, error, text, startProgress, endProgress }) {
		if (text) {
			error = null;

			try {
				startProgress();
				value = await text2filter(text, fields);
				$.set(textValue, value ? getQueryString(value).query : "", true);
			} catch(e) {
				error = e;
			} finally {
				endProgress();
			}
		}

		if (error) {
			helpers.showNotice({ text: error.message, type: "danger" });

			if (error.code !== "NO_DATA") return;
		}

		$.set(filter, createFilter(value, {}, fields), true);
	}

	const url = "https://master--svar-filter-natural-text--dev.webix.io/text-to-json";

	async function text2filter(text, fields) {
		const response = await fetch(url, { method: "POST", body: JSON.stringify({ text, fields }) });
		const json = await response.json();

		if (!response.ok) {
			helpers.showNotice({ text: json.error || "Request failed", type: "danger" });

			return null;
		}

		return json;
	}

	var div = root();
	var node = $.sibling($.child(div), 2);

	FilterQuery(node, {
		get value() {
			return $.get(textValue);
		},
		placeholder: 'E.g. Stars: >3000',
		get fields() {
			return fields;
		},

		get options() {
			return options;
		},
		onchange: handleFilter
	});

	var div_1 = $.sibling(node, 6);
	var node_1 = $.child(div_1);

	$.bind_this(
		Grid(node_1, {
			get data() {
				return allData;
			},

			get columns() {
				return allColumns;
			}
		}),
		($$value) => $.set(api, $$value, true),
		() => $.get(api)
	);

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}