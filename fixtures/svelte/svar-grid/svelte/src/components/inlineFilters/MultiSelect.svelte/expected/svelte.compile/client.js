import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getContext } from "svelte";
import { locale } from "@svar-ui/lib-dom";
import { en } from "@svar-ui/grid-locales";
import MultiSelect from "../MultiSelect.svelte";

var root = $.from_html(`<div style="width:100%;"><!></div>`);

export default function MultiSelect_1($$anchor, $$props) {
	$.push($$props, true);

	const _ = getContext("wx-i18n")?.getGroup("grid") || locale(en).getGroup("grid");

	const config = $.derived(() => {
		const obj = $$props.filter?.config || {};

		return { clear: true, ...obj };
	});

	let options = $.derived(() => $.get(config).options || $$props.column.options);

	const text = $.derived(() => {
		const len = $$props.filterValue?.length;

		if (!len) return "";
		if (len < 3) return $$props.filterValue.map((v) => $$props.column.optionsMap.get(v)).join(", ");

		return len + " " + _("selected");
	});

	function filterRows({ value }) {
		$$props.action({ value, key: $$props.column.id });
	}

	function handleKeyDown(ev) {
		if (ev.key !== "Tab") ev.preventDefault();
	}

	var div = root();
	var node = $.child(div);

	{
		let $0 = $.derived(() => $$props.filterValue || []);

		MultiSelect(node, $.spread_props({ placeholder: "" }, () => $.get(config), {
			get options() {
				return $.get(options);
			},

			get value() {
				return $.get($0);
			},

			get text() {
				return $.get(text);
			},
			onchange: filterRows
		}));
	}

	$.reset(div);
	$.delegated('keydown', div, handleKeyDown);
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['keydown']);