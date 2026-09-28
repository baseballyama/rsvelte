<script lang="ts">
    import type { Datum, Layout, PlotData } from "plotly.js";
    import PivotData from "./PivotData";
    import Plotly from "./UI/Plotly.svelte";

    let { plotlyOptions = {}, plotlyConfig = {}, onRendererUpdate, ...restProps } = $props();

    let pivotData: PivotData,
        rowKeys: Datum[][],
        colKeys: Datum[][],
        layout: Partial<Layout> = $state.raw({}),
        data: Partial<PlotData> = $state.raw({ type: "scatter", mode: "markers" });

    $effect(() => {
        pivotData = new PivotData(restProps);
        rowKeys = pivotData.getRowKeys();
        colKeys = pivotData.getColKeys();
        if (rowKeys.length === 0) {
            rowKeys.push([]);
        }
        if (colKeys.length === 0) {
            colKeys.push([]);
        }

        data.x = [] as Datum[];
        data.y = [] as Datum[];
        data.text = [] as string[];

        for (const rowKey of rowKeys) {
            for (const colKey of colKeys) {
                const v = pivotData.getAggregator(rowKey, colKey).value();
                if (v !== null) {
                    data.x.push(colKey.join("-"));
                    data.y.push(rowKey.join("-"));
                    data.text.push(String(v));
                }
            }
        }

        layout = {
            title: { text: pivotData.props.rows.join("-") + " vs " + pivotData.props.cols.join("-") },
            hovermode: "closest",
            xaxis: { title: { text: pivotData.props.cols.join("-") }, automargin: true },
            yaxis: { title: { text: pivotData.props.rows.join("-") }, automargin: true },
            /* eslint-disable no-magic-numbers */
            width: window.innerWidth / 1.5,
            height: window.innerHeight / 1.4 - 50,
            /* eslint-enable no-magic-numbers */
        };
    });
</script>

<Plotly
    data={[data]}
    layout={Object.assign(layout ?? {}, plotlyOptions)}
    config={plotlyConfig}
    onUpdate={onRendererUpdate}
/>
