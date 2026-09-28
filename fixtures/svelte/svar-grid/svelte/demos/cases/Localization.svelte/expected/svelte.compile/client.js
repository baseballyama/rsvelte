import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getData } from "../data";
import { Grid, ContextMenu, HeaderMenu } from "../../src";
import { Locale, Segmented } from "@svar-ui/svelte-core";
import { en, cn } from "@svar-ui/grid-locales";
import { en as enCore, cn as cnCore } from "@svar-ui/core-locales";

var root = $.from_html(`<div class="demo svelte-sl324a"><!> <!></div>`);

export default function Localization($$anchor, $$props) {
	$.push($$props, true);

	const { allData: data, countries, users } = getData();
	let table = $.state(void 0);

	function init(api) {
		$.set(table, api, true);
	}

	const columns = [
		{ id: "id", width: 50 },
		{ id: "firstName", header: "Name", editor: "text", width: 180 },
		{
			id: "country",
			header: "Country",
			editor: {
				type: "combo",
				config: { template: (option) => `${option.id}. ${option.label}` }
			},
			options: countries,
			width: 180
		},

		{
			id: "date",
			header: "Date",
			width: 180,
			editor: "datepicker",
			template: (v) => v ? v.toLocaleDateString() : ""
		},

		{
			id: "user",
			header: "User",
			width: 180,
			editor: "richselect",
			options: users
		}
	];

	let language = $.state("en");
	var div = root();
	var node = $.child(div);

	Segmented(node, {
		options: [
			{ id: "en", label: "English" },
			{ id: "cn", label: "Chinese" }
		],

		get value() {
			return $.get(language);
		},

		set value($$value) {
			$.set(language, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent = ($$anchor) => {
			{
				let $0 = $.derived(() => ({ ...en, ...enCore }));

				Locale($$anchor, {
					get words() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						ContextMenu($$anchor, {
							get api() {
								return $.get(table);
							},

							children: ($$anchor, $$slotProps) => {
								HeaderMenu($$anchor, {
									get api() {
										return $.get(table);
									},

									children: ($$anchor, $$slotProps) => {
										Grid($$anchor, {
											get data() {
												return data;
											},

											get columns() {
												return columns;
											},
											init
										});
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			}
		};

		var consequent_1 = ($$anchor) => {
			{
				let $0 = $.derived(() => ({ ...cn, ...cnCore }));

				Locale($$anchor, {
					get words() {
						return $.get($0);
					},

					children: ($$anchor, $$slotProps) => {
						ContextMenu($$anchor, {
							get api() {
								return $.get(table);
							},

							children: ($$anchor, $$slotProps) => {
								HeaderMenu($$anchor, {
									get api() {
										return $.get(table);
									},

									children: ($$anchor, $$slotProps) => {
										Grid($$anchor, {
											get data() {
												return data;
											},

											get columns() {
												return columns;
											},
											init
										});
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});
			}
		};

		$.if(node_1, ($$render) => {
			if ($.get(language) == "en") $$render(consequent); else if ($.get(language) == "cn") $$render(consequent_1, 1);
		});
	}

	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}