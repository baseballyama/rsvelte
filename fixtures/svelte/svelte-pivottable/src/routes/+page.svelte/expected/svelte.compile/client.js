import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import PivotTableUI from "$lib/PivotTableUI.svelte";
import PlotlyRenderers from "$lib/PlotlyRenderers";
import TableRenderers from "$lib/TableRenderers";
import { derivers } from "$lib/Utilities";
import { onMount } from "svelte";
import data from "./_montreal.json";

var root = $.with_script($.from_html(`<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet"/> <link href="https://fonts.googleapis.com/css?family=Dosis|Open+Sans" rel="stylesheet"/> <script src="https://cdn.plot.ly/plotly-basic-latest.min.js"></script>`, 1));
var root_1 = $.from_html(`<nav class="navbar navbar-inverse navbar-static-top svelte-1uha8ag"><div class="container"><div class="navbar-header"><button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar"><span class="sr-only">Toggle navigation</span> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span></button> <a class="navbar-brand" href="#">svelte-pivottable</a></div> <div id="navbar" class="navbar-collapse collapse"></div></div></nav> <div class="jumbotron svelte-1uha8ag"><div class="container"><h1 class="svelte-1uha8ag">svelte-pivottable</h1> <p class="svelte-1uha8ag">Svelte-based drag'n'drop pivot table with grouping and Plotly.js charts.</p> <p class="svelte-1uha8ag"><a class="btn btn-primary btn-lg svelte-1uha8ag" href="https://github.com/plotly/svelte-pivottable#readme" role="button">Get started &raquo;</a></p></div></div> <div class="container"><div class="row text-center"><div class="col-md-2 col-md-offset-3"><label class=" checkbox-inline" style="text-transform: capitalize;"><input type="checkbox"/> Grouping</label></div> <fieldset class="col-md-6"><label class=" checkbox-inline" style="text-transform: capitalize;"><input type="checkbox"/> Compact Rows</label> <label class=" checkbox-inline" style="text-transform: capitalize;"><input type="checkbox"/> Rows totals above</label> <label class=" checkbox-inline" style="text-transform: capitalize;"><input type="checkbox"/> Cols totals before</label></fieldset> <br/><br/></div> <!> <hr/> <footer style="text-align: center"><p class="svelte-1uha8ag">&copy; 2022 Jakub Jagielka</p></footer></div>`, 1);

export default function _page($$anchor, $$props) {
	$.push($$props, true);

	let plotlyRenderers = {};
	let renderers = $.state($.proxy({}));

	onMount(async () => {
		// plotly.js requires an access to window object
		// static import in sveltekit causes a problem
		// const Plotly = await import("plotly.js/dist/plotly");
		const Plotly = window.Plotly;

		// create Plotly renderers via dependency injection
		plotlyRenderers = PlotlyRenderers(Plotly);

		// plotlyRenderers = {};
		$.set(renderers, { ...TableRenderers, ...plotlyRenderers }, true);
	});

	let grouping = $.state(true);
	let compactRows = $.state(true);
	let rowGroupBefore = $.state(true);
	let colGroupBefore = $.state(false);

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

	var fragment_1 = root_1();

	$.head('1uha8ag', ($$anchor) => {
		var fragment = root();

		$.next(4);

		$.effect(() => {
			$.document.title = 'Svelte pivottable';
		});

		$.append($$anchor, fragment);
	});

	var div = $.sibling($.first_child(fragment_1), 4);
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var label = $.child(div_2);
	var input = $.child(label);

	$.remove_input_defaults(input);
	$.next();
	$.reset(label);
	$.reset(div_2);

	var fieldset = $.sibling(div_2, 2);
	var label_1 = $.child(fieldset);
	var input_1 = $.child(label_1);

	$.remove_input_defaults(input_1);
	$.next();
	$.reset(label_1);

	var label_2 = $.sibling(label_1, 2);
	var input_2 = $.child(label_2);

	$.remove_input_defaults(input_2);
	$.next();
	$.reset(label_2);

	var label_3 = $.sibling(label_2, 2);
	var input_3 = $.child(label_3);

	$.remove_input_defaults(input_3);
	$.next();
	$.reset(label_3);
	$.reset(fieldset);
	$.next(3);
	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	PivotTableUI(node, $.spread_props(() => options, {
		get renderers() {
			return $.get(renderers);
		},

		get grouping() {
			return $.get(grouping);
		},

		get compactRows() {
			return $.get(compactRows);
		},

		get rowGroupBefore() {
			return $.get(rowGroupBefore);
		},

		get colGroupBefore() {
			return $.get(colGroupBefore);
		},
		tableOptions: { clickCallback: console.log }
	}));

	$.next(4);
	$.reset(div);
	$.template_effect(() => fieldset.disabled = !$.get(grouping));
	$.bind_checked(input, () => $.get(grouping), ($$value) => $.set(grouping, $$value));
	$.bind_checked(input_1, () => $.get(compactRows), ($$value) => $.set(compactRows, $$value));
	$.bind_checked(input_2, () => $.get(rowGroupBefore), ($$value) => $.set(rowGroupBefore, $$value));
	$.bind_checked(input_3, () => $.get(colGroupBefore), ($$value) => $.set(colGroupBefore, $$value));
	$.append($$anchor, fragment_1);
	$.pop();
}