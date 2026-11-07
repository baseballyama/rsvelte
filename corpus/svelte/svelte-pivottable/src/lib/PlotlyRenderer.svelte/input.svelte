<script lang="ts">
    import type { Layout, PlotData } from "plotly.js";
    import PivotData from "./PivotData";
    import Plotly from "./UI/Plotly.svelte";
    import type { Datum } from "./types";

    let {
        plotlyOptions = {},
        plotlyConfig = {},
        onRendererUpdate,

        traceOptions = {},
        layoutOptions = {},
        transpose = false,

        aggregatorName,
        aggregators,

        ...restProps
    } = $props();

    let pivotData: PivotData,
        rowKeys: Datum[][],
        colKeys: Datum[][],
        traceKeys: Datum[][],
        datumKeys: Datum[][],
        numInputs: number,
        data: Partial<PlotData>[] = $state.raw([]),
        hAxisTitle,
        groupByTitle,
        layout: Partial<Layout> = $state.raw({});

    $effect(() => {
        pivotData = new PivotData(restProps);
        rowKeys = pivotData.getRowKeys();
        colKeys = pivotData.getColKeys();
        traceKeys = transpose ? colKeys : rowKeys;
        if (traceKeys.length === 0) {
            traceKeys.push([]);
        }
        datumKeys = transpose ? rowKeys : colKeys;
        if (datumKeys.length === 0) {
            datumKeys.push([]);
        }

        let fullAggregatorName = aggregatorName;
        numInputs = aggregators[aggregatorName as keyof typeof aggregators]([])().numInputs || 0;
        if (numInputs !== 0) {
            fullAggregatorName += ` of ${pivotData.props.vals.slice(0, numInputs).join(", ")}`;
        }
        const dataTemp = traceKeys.map((traceKey) => {
            const values = [];
            const labels = [];
            for (const datumKey of datumKeys) {
                const val = parseFloat(
                    pivotData
                        .getAggregator(transpose ? datumKey : traceKey, transpose ? traceKey : datumKey)
                        .value() as string,
                );
                values.push(isFinite(val) ? val : null);
                labels.push(datumKey.join("-") || " ");
            }
            const trace: Partial<PlotData> = { name: traceKey.join("-") || fullAggregatorName };
            if (traceOptions.type === "pie") {
                trace.values = values;
                trace.labels = labels.length > 1 ? labels : [fullAggregatorName];
            } else {
                trace.x = transpose ? values : labels;
                trace.y = transpose ? labels : values;
            }
            return Object.assign(trace, traceOptions) as Partial<PlotData>;
        });

        let titleText = fullAggregatorName;
        hAxisTitle = transpose ? pivotData.props.rows.join("-") : pivotData.props.cols.join("-");
        groupByTitle = transpose ? pivotData.props.cols.join("-") : pivotData.props.rows.join("-");
        if (hAxisTitle !== "") {
            titleText += ` vs ${hAxisTitle}`;
        }
        if (groupByTitle !== "") {
            titleText += ` by ${groupByTitle}`;
        }

        const layoutTemp: Partial<Layout> = {
            title: { text: titleText },
            hovermode: "closest",
            /* eslint-disable no-magic-numbers */
            width: window.innerWidth / 1.5,
            height: window.innerHeight / 1.4 - 50,
            /* eslint-enable no-magic-numbers */
        };

        if (traceOptions.type === "pie") {
            const columns = Math.ceil(Math.sqrt(dataTemp.length));
            const rows = Math.ceil(dataTemp.length / columns);
            layoutTemp.grid = { columns, rows };
            dataTemp.forEach((d, i) => {
                d.domain = {
                    row: Math.floor(i / columns),
                    column: i - columns * Math.floor(i / columns),
                };
                if (dataTemp.length > 1) {
                    d.title = { text: d.name };
                }
            });
            if (dataTemp[0].labels?.length === 1) {
                layoutTemp.showlegend = false;
            }
        } else {
            layoutTemp.xaxis = {
                title: transpose ? { text: aggregatorName } : undefined,
                automargin: true,
            };
            layoutTemp.yaxis = {
                title: transpose ? undefined : { text: aggregatorName },
                automargin: true,
            };
        }

        data = dataTemp;
        layout = layoutTemp;
    });
</script>

<Plotly
    layout={{ ...layout, ...layoutOptions, ...plotlyOptions }}
    {data}
    config={plotlyConfig}
    onUpdate={onRendererUpdate}
/>
