<script lang="ts">
    import PivotTableUI from "$lib/PivotTableUI.svelte";
    import PlotlyRenderers from "$lib/PlotlyRenderers";
    import TableRenderers from "$lib/TableRenderers";
    import { derivers } from "$lib/Utilities";
    import { onMount } from "svelte";
    import data from "./_montreal.json";

    let plotlyRenderers = {};
    let renderers = $state({});

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

    let grouping = $state(true),
        compactRows = $state(true),
        rowGroupBefore = $state(true),
        colGroupBefore = $state(false);

    const derivedAttributes = {
        "Age Bin": derivers.bin("Age", 10),
        "Gender Imbalance": function (mp: any) {
            return mp["Gender"] == "Male" ? 1 : -1;
        },
    };

    let options = {
        rows: ["Province", "Party"],
        cols: ["Gender", "Age Bin"],

        data,
        derivedAttributes,
        hiddenFromAggregators: ["Province", "Party"],
    };
</script>

<svelte:head>
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css?family=Dosis|Open+Sans" rel="stylesheet" />
    <script src="https://cdn.plot.ly/plotly-basic-latest.min.js"></script>

    <title>Svelte pivottable</title>
</svelte:head>

<nav class="navbar navbar-inverse navbar-static-top">
    <div class="container">
        <div class="navbar-header">
            <button
                type="button"
                class="navbar-toggle collapsed"
                data-toggle="collapse"
                data-target="#navbar"
                aria-expanded="false"
                aria-controls="navbar"
            >
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <!-- svelte-ignore a11y_invalid_attribute -->
            <a class="navbar-brand" href="#">svelte-pivottable</a>
        </div>
        <div id="navbar" class="navbar-collapse collapse"></div>
        <!--/.navbar-collapse -->
    </div>
</nav>

<!-- Main jumbotron for a primary marketing message or call to action -->
<div class="jumbotron">
    <div class="container">
        <h1>svelte-pivottable</h1>
        <p>Svelte-based drag'n'drop pivot table with grouping and Plotly.js charts.</p>
        <p>
            <a class="btn btn-primary btn-lg" href="https://github.com/plotly/svelte-pivottable#readme" role="button"
                >Get started &raquo;</a
            >
        </p>
    </div>
</div>

<div class="container">
    <div class="row text-center">
        <div class="col-md-2 col-md-offset-3">
            <label class=" checkbox-inline" style="text-transform: capitalize;">
                <input type="checkbox" bind:checked={grouping} /> Grouping
            </label>
        </div>
        <fieldset class="col-md-6" disabled={!grouping}>
            <label class=" checkbox-inline" style="text-transform: capitalize;">
                <input type="checkbox" bind:checked={compactRows} /> Compact Rows
            </label>

            <label class=" checkbox-inline" style="text-transform: capitalize;">
                <input type="checkbox" bind:checked={rowGroupBefore} /> Rows totals above
            </label>
            <label class=" checkbox-inline" style="text-transform: capitalize;">
                <input type="checkbox" bind:checked={colGroupBefore} /> Cols totals before
            </label>
        </fieldset>
        <br /><br />
    </div>

    <PivotTableUI
        {...options}
        {renderers}
        {grouping}
        {compactRows}
        {rowGroupBefore}
        {colGroupBefore}
        tableOptions={{ clickCallback: console.log }}
    />

    <hr />
    <footer style="text-align: center">
        <p>&copy; 2022 Jakub Jagielka</p>
    </footer>
</div>

<!-- /container -->
<style>
    :global(body) {
        min-height: 1400px;
        padding-bottom: 20px;
    }
    :global(.pvtUi) {
        width: 100%;
    }
    p,
    .navbar {
        font-family: "Open Sans", sans-serif;
        font-size: 16px;
        line-height: 26px;
    }

    .navbar {
        margin-bottom: 0;
    }
    .jumbotron {
        color: white;
        background: linear-gradient(27deg, #1e427d 0%, #1d9cfc 100%);
        text-align: center;
    }

    .jumbotron h1 {
        font-size: 58px;
        line-height: 60px;
        font-family: "Dosis", sans-serif;
    }

    .jumbotron p {
        font-size: 22px;
        line-height: 36px;
    }

    /* h2 {
        font-size: 34px;
        line-height: 44px;
        font-family: "Dosis", sans-serif;
    } */

    .btn-primary {
        background: #119dff;
        border: 1px solid #119dff;
    }
    /* .btn-default {
        background: #f2f5fa;
        border: 1px solid #c8d4e3;
    }
    .pvtUi {
        width: 100%;
    }
    .pvtVertList {
        width: 15%;
    }

    textarea {
        width: 100%;
        height: 100px;
    }

    .dropzone {
        width: 100%;
        height: 100px;
        padding: 10px;
        border: 2px dashed lightgrey;
        cursor: pointer;
    }
    .dropzoneActive {
        border: 2px dashed green;
    }
    .dropzoneReject {
        border: 2px dashed red;
    } */
</style>
