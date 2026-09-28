import * as $ from 'svelte/internal/server';
import PivotTableUI from "$lib/PivotTableUI.svelte";
import PlotlyRenderers from "$lib/PlotlyRenderers";
import TableRenderers from "$lib/TableRenderers";
import { derivers } from "$lib/Utilities";
import { onMount } from "svelte";
import data from "./_montreal.json";

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let plotlyRenderers = {};
		let renderers = {};

		onMount(async () => {
			// plotly.js requires an access to window object
			// static import in sveltekit causes a problem
			// const Plotly = await import("plotly.js/dist/plotly");
			const Plotly = window.Plotly;

			// create Plotly renderers via dependency injection
			plotlyRenderers = PlotlyRenderers(Plotly);

			// plotlyRenderers = {};
			renderers = { ...TableRenderers, ...plotlyRenderers };
		});

		let grouping = true;
		let compactRows = true;
		let rowGroupBefore = true;
		let colGroupBefore = false;

		const derivedAttributes = {
			"Age Bin": derivers.bin("Age", 10),
			"Gender Imbalance": function (mp) {
				return mp["Gender"] == "Male" ? 1 : -1;
			}
		};

		let options = {
			rows: ["Province", "Party"],
			cols: ["Gender", "Age Bin"],
			data,
			derivedAttributes,
			hiddenFromAggregators: ["Province", "Party"]
		};

		$.head('1uha8ag', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Svelte pivottable</title>`);
			});

			$$renderer.push(`<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet"/> <link href="https://fonts.googleapis.com/css?family=Dosis|Open+Sans" rel="stylesheet"/> `);
			$$renderer.push(`<script src="https://cdn.plot.ly/plotly-basic-latest.min.js"></script>`);
		});

		$$renderer.push(`<nav class="navbar navbar-inverse navbar-static-top svelte-1uha8ag"><div class="container"><div class="navbar-header"><button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar"><span class="sr-only">Toggle navigation</span> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span></button> <a class="navbar-brand" href="#">svelte-pivottable</a></div> <div id="navbar" class="navbar-collapse collapse"></div></div></nav> <div class="jumbotron svelte-1uha8ag"><div class="container"><h1 class="svelte-1uha8ag">svelte-pivottable</h1> <p class="svelte-1uha8ag">Svelte-based drag'n'drop pivot table with grouping and Plotly.js charts.</p> <p class="svelte-1uha8ag"><a class="btn btn-primary btn-lg svelte-1uha8ag" href="https://github.com/plotly/svelte-pivottable#readme" role="button">Get started »</a></p></div></div> <div class="container"><div class="row text-center"><div class="col-md-2 col-md-offset-3"><label class="checkbox-inline" style="text-transform: capitalize;"><input type="checkbox"${$.attr('checked', grouping, true)}/> Grouping</label></div> <fieldset class="col-md-6"${$.attr('disabled', !grouping, true)}><label class="checkbox-inline" style="text-transform: capitalize;"><input type="checkbox"${$.attr('checked', compactRows, true)}/> Compact Rows</label> <label class="checkbox-inline" style="text-transform: capitalize;"><input type="checkbox"${$.attr('checked', rowGroupBefore, true)}/> Rows totals above</label> <label class="checkbox-inline" style="text-transform: capitalize;"><input type="checkbox"${$.attr('checked', colGroupBefore, true)}/> Cols totals before</label></fieldset> <br/><br/></div> `);

		PivotTableUI($$renderer, $.spread_props([
			options,
			{
				renderers,
				grouping,
				compactRows,
				rowGroupBefore,
				colGroupBefore,
				tableOptions: { clickCallback: console.log }
			}
		]));

		$$renderer.push(`<!----> <hr/> <footer style="text-align: center"><p class="svelte-1uha8ag">© 2022 Jakub Jagielka</p></footer></div>`);
	});
}