import * as $ from 'svelte/internal/server';
import Table from "../markdown/Table.svelte";
import Thead from "../markdown/Thead.svelte";
import Tbody from "../markdown/Tbody.svelte";
import Tr from "../markdown/Tr.svelte";
import Th from "../markdown/Th.svelte";
import Td from "../markdown/Td.svelte";
import InfoPopover from "./InfoPopover.svelte";
import { cn } from "$lib/utils";
import { H3 } from "../markdown";

export default function APITable($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;

		const isPropsTable = (data) => {
			return "props" in data;
		};

		let tableData = $.derived(() => isPropsTable(data) ? data.props : data);
		let tableHeaders = ["Name", "Type", "Default", "Description"];
		let tableKeys = ["name", "type", "default", "description"];

		if (isPropsTable(data)) {
			$$renderer.push(`<!--[0--><div class="space-y-2">`);

			H3($$renderer, {
				id: data.name,
				class: 'mt-0 text-xl font-semibold',
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(data.name)}`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (data.desc) {
				$$renderer.push(`<!--[0--><p class="m-0 leading-relaxed text-muted-foreground">${$.escape(data.desc)}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		Table($$renderer, {
			children: ($$renderer) => {
				Thead($$renderer, {
					children: ($$renderer) => {
						Tr($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!--[-->`);

								const each_array = $.ensure_array_like(tableHeaders);

								for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
									let header = each_array[$$index];

									Th($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(header)}`);
										},
										$$slots: { default: true }
									});
								}

								$$renderer.push(`<!--]-->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Tbody($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!--[-->`);

						const each_array_1 = $.ensure_array_like(tableData());

						for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
							let row = each_array_1[i];

							Tr($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!--[-->`);

									const each_array_2 = $.ensure_array_like(tableKeys);

									for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
										let key = each_array_2[index];

										Td($$renderer, {
											children: ($$renderer) => {
												$$renderer.push(`<span class="inline-flex items-center"><code${$.attr_class($.clsx(cn("rounded-sm border  bg-muted/40 px-1.5 py-0.5 font-normal text-foreground")))}>${$.escape(key === "default" && row.required ? "required" : row[key] || "")}</code> `);

												if (index === 0 && row.description) {
													$$renderer.push('<!--[0-->');
													InfoPopover($$renderer, { description: row.description });
												} else {
													$$renderer.push('<!--[-1-->');
												}

												$$renderer.push(`<!--]--></span>`);
											},
											$$slots: { default: true }
										});
									}

									$$renderer.push(`<!--]-->`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}