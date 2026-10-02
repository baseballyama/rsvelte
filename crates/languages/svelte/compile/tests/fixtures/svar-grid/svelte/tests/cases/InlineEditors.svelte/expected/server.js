import * as $ from 'svelte/internal/server';
import { Grid } from "../../src";
import { getData } from "../data";
import { Willow, Locale } from "@svar-ui/svelte-core";

export default function InlineEditors($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { data } = getData();

		const columns = [
			{ id: "id", width: 50 },
			{ id: "city", header: "City", editor: "text", width: 160 },
			{
				id: "email",
				header: "Email",
				editor: "text",
				width: 250,
				css: "center"
			},
			{ id: "city1", header: "City", editor: "text", width: 160 },
			{
				id: "email1",
				header: "Email",
				editor: "text",
				width: 250,
				css: "center",
				hidden: true
			},
			{ id: "city2", header: "City", editor: "text", width: 160 },
			{
				id: "email2",
				header: "Email",
				editor: "text",
				width: 250,
				css: "center"
			},
			{ id: "city3", header: "City", editor: "text", width: 160 },
			{
				id: "email3",
				header: "Email",
				editor: "text",
				width: 250,
				css: "center"
			},
			{ id: "city4", header: "City", editor: "text", width: 160 },
			{
				id: "email4",
				header: "Email",
				editor: "text",
				width: 250,
				css: "center"
			},
			{ id: "city5", header: "City", editor: "text", width: 160 },
			{
				id: "email5",
				header: "Email",
				editor: "text",
				width: 250,
				css: "center"
			},
			{ id: "city6", header: "City", editor: "text", width: 160 },
			{
				id: "email6",
				header: "Email",
				editor: "text",
				width: 250,
				css: "center"
			}
		];

		Willow($$renderer, {
			children: ($$renderer) => {
				Locale($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<div style="padding: 20px;"><h4>Table with editable cells (use double click to activate an
				editor)</h4> <div style="height: 320px;">`);

						Grid($$renderer, { data, columns });
						$$renderer.push(`<!----></div></div>`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});
	});
}