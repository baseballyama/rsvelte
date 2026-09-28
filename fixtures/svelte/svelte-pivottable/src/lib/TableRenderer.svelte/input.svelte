<script lang="ts">
    import "./grouping.css";
    import PivotData from "./PivotData";
    import "./pivottable.css";
    import type { Data, Datum, TableRendererProps } from "./types";

    let {
        tableColorScaleGenerator = redColorScaleGenerator,
        tableOptions = {},
        compactRows = true,

        opts = {},
        ...restProps
    }: TableRendererProps = $props();

    let pivotData = $state.raw(new PivotData(restProps));
    $effect(() => {
        // When this is $derived we experience issues
        pivotData = new PivotData(restProps);
    });

    // helper function for setting row/col-span in pivotTableRenderer
    const spanSize = function (arr: any[], i: number, j: number, no_loop = false) {
        let x;
        if (i !== 0) {
            let asc, end;
            let noDraw = true;
            for (x = 0, end = j, asc = end >= 0; asc ? x <= end : x >= end; asc ? x++ : x--) {
                if (arr[i - 1][x] !== arr[i][x]) {
                    noDraw = false;
                }
            }
            if (noDraw) {
                return -1;
            }
        }
        let len = 0;
        while (i + len < arr.length) {
            let asc1, end1;
            let stop = false;
            for (x = no_loop ? j : 0, end1 = j, asc1 = end1 >= 0; asc1 ? x <= end1 : x >= end1; asc1 ? x++ : x--) {
                if (arr[i][x] !== arr[i + len][x]) {
                    stop = true;
                }
            }
            if (stop) {
                break;
            }
            len++;
        }
        return len;
    };

    function redColorScaleGenerator(values: Datum[]) {
        const min = Math.min(...values.map(Number).filter((x) => x));
        const max = Math.max(...values.map(Number).filter((x) => x));
        return (x: Datum) => {
            // eslint-disable-next-line no-magic-numbers
            const nonRed = 255 - Math.round((255 * (Number(x) - min)) / (max - min));
            return `background-color: rgb(255,${nonRed},${nonRed})`;
        };
    }

    const flatKey = (arr: Datum[]) => arr.join(String.fromCharCode(0));
    const has = (set: Set<string>, arr: string[]) => arr.every(set.has, set);
    const add = (set: Set<string>, arr: string[]) => (arr.forEach(set.add, set), set);
    const remove = (set: Set<string>, arr: string[]) => (arr.forEach(set.delete, set), set);
    const toggle = (set: Set<string>, arr: string[]) => (has(set, arr) ? remove : add)(set, arr);

    let grandTotalAggregator = $derived(pivotData.getAggregator([], []));

    let grouping = $derived(pivotData.props.grouping);

    let folded = $state.raw(new Set<string>());
    const isFolded = (keys: Datum[][]) => has(folded, keys.map(flatKey));
    const fold = (keys: Datum[][]) => (folded = toggle(new Set(folded), keys.map(flatKey)));

    let valueCellColors = $state((r: Datum[], c: Datum[], v: Datum): string => "");
    let rowTotalColors = $state((v: Datum): string => "");
    let colTotalColors = $state((v: Datum): string => "");

    let [rowKeys, colKeys]: Datum[][][] = $derived.by(() => {
        let rowKeys = pivotData.getRowKeys(true);
        let colKeys = pivotData.getColKeys(true);

        if (grouping) {
            for (const key of folded) {
                const keyEx = key + String.fromCharCode(0);
                colKeys = colKeys.filter((colKey) => !flatKey(colKey).startsWith(keyEx));
                rowKeys = rowKeys.filter((rowKey) => !flatKey(rowKey).startsWith(keyEx));
            }
        }
        return [rowKeys, colKeys];
    });

    $effect(() => {
        if (opts.heatmapMode) {
            const dataRowKeys = pivotData.getRowKeys(false);
            const dataColKeys = pivotData.getColKeys(false);

            const colorScaleGenerator = tableColorScaleGenerator;
            const rowTotalValues = dataColKeys.map((x) => pivotData.getAggregator([], x).value());
            rowTotalColors = colorScaleGenerator(rowTotalValues);
            const colTotalValues = dataRowKeys.map((x) => pivotData.getAggregator(x, []).value());
            colTotalColors = colorScaleGenerator(colTotalValues);

            if (opts.heatmapMode === "full") {
                const allValues: Datum[] = [];
                dataRowKeys.forEach((r) =>
                    dataColKeys.forEach((c) => allValues.push(pivotData.getAggregator(r, c).value())),
                );
                const colorScale = colorScaleGenerator(allValues);
                valueCellColors = (r, c, v) => colorScale(v);
            } else if (opts.heatmapMode === "row") {
                const rowColorScales: Record<string, Function> = {};
                dataRowKeys.forEach((r) => {
                    const rowValues = dataColKeys.map((x) => pivotData.getAggregator(r, x).value());
                    rowColorScales[flatKey(r)] = colorScaleGenerator(rowValues);
                });
                valueCellColors = (r, c, v) => rowColorScales[flatKey(r)](v);
            } else if (opts.heatmapMode === "col") {
                const colColorScales: Record<string, Function> = {};
                dataColKeys.forEach((c) => {
                    const colValues = dataRowKeys.map((x) => pivotData.getAggregator(x, c).value());
                    colColorScales[flatKey(c)] = colorScaleGenerator(colValues);
                });
                valueCellColors = (r, c, v) => colColorScales[flatKey(c)](v);
            }
        }
    });

    const clickClass = (pred: boolean, closed: boolean) => (pred ? " pvtClickable" + (closed ? " closed" : "") : "");

    let getClickHandler = $derived.by(() => {
        if (tableOptions && tableOptions.clickCallback) {
            return (value: Datum, rowValues: Datum[], colValues: Datum[]) => {
                const filters: Data = {};
                for (const i in pivotData.props.cols || []) {
                    const attr = pivotData.props.cols[i];
                    if (colValues[i] !== null) {
                        filters[attr] = colValues[i];
                    }
                }
                for (const i in pivotData.props.rows || []) {
                    const attr = pivotData.props.rows[i];
                    if (rowValues[i] !== null) {
                        filters[attr] = rowValues[i];
                    }
                }

                return (e: MouseEvent) => tableOptions.clickCallback?.(e, value, filters, pivotData);
            };
        }
    });
</script>

<table
    class={[
        "pvtTable",
        grouping && (pivotData.props.rowGroupBefore ? "rowGroupBefore" : "rowGroupAfter"),
        grouping && (pivotData.props.colGroupBefore ? "colGroupBefore" : "colGroupAfter"),
    ]}
>
    <thead>
        {#each pivotData.props.cols as c, j (`col-Attr${j}`)}
            {@const clickable = grouping && pivotData.props.cols.length > j + 1}
            {@const levelKeys = colKeys.filter((x) => x.length === j + 1)}
            <tr>
                {#if j === 0 && pivotData.props.rows.length !== 0}
                    <th colSpan={pivotData.props.rows.length} rowSpan={pivotData.props.cols.length}></th>
                {/if}

                <th
                    class={"pvtAxisLabel" + clickClass(clickable, isFolded(levelKeys))}
                    onclick={clickable ? (_) => fold(levelKeys) : null}
                >
                    {c}
                </th>
                {#each colKeys as colKey, i (`colKey${i}`)}
                    {@const xx = spanSize(colKeys, i, j)}
                    {#if xx !== -1}
                        <th
                            class={"pvtColLabel" +
                                clickClass(clickable && !!colKey[j], isFolded([colKey.slice(0, j + 1)]))}
                            colSpan={xx}
                            rowSpan={j === pivotData.props.cols.length - 1 && pivotData.props.rows.length !== 0 ? 2 : 1}
                            onclick={clickable && colKey[j] ? (_) => fold([colKey.slice(0, j + 1)]) : null}
                        >
                            {colKey[j] ?? ""}
                        </th>
                    {/if}
                {/each}

                {#if j === 0}
                    <th
                        class="pvtTotalLabel"
                        rowSpan={pivotData.props.cols.length + (pivotData.props.rows.length === 0 ? 0 : 1)}
                    >
                        Totals
                    </th>
                {/if}
            </tr>
        {/each}

        {#if pivotData.props.rows.length !== 0}
            <tr>
                {#each pivotData.props.rows as r, i (`row-Attr${i}`)}
                    {@const clickable = grouping && pivotData.props.rows.length > i + 1}
                    {@const levelKeys = rowKeys.filter((x) => x.length === i + 1)}

                    <th
                        class={"pvtAxisLabel" + clickClass(clickable, isFolded(levelKeys))}
                        onclick={clickable ? (_) => fold(levelKeys) : null}
                    >
                        {r}
                    </th>
                {/each}
                <th class="pvtTotalLabel">
                    {pivotData.props.cols.length === 0 ? "Totals" : ""}
                </th>
            </tr>
        {/if}
    </thead>

    <tbody>
        {#each rowKeys as rowKey, i (`rowKeyRow${i}`)}
            {@const totalAggregator = pivotData.getAggregator(rowKey, [])}
            {@const rowGap = pivotData.props.rows.length - rowKey.length}
            {@const useCompactRows = grouping && compactRows}

            <tr class={rowGap ? "pvtLevel" + rowGap : "pvtData"}>
                {#each rowKey as txt, j (`rowKeyLabel${i}-${j}`)}
                    {@const clickable = grouping && pivotData.props.rows.length > j + 1}
                    {@const specialCase = grouping && !pivotData.props.rowGroupBefore}
                    {@const xx = useCompactRows ? 1 : spanSize(rowKeys, i, j, specialCase)}
                    {#if !((useCompactRows && j < rowKey.length - 1) || xx === -1)}
                        <th
                            class={"pvtRowLabel" +
                                clickClass(clickable && !!rowKey[j], isFolded([rowKey.slice(0, j + 1)]))}
                            rowSpan={xx}
                            colSpan={useCompactRows
                                ? pivotData.props.rows.length + 1
                                : j === pivotData.props.rows.length - 1 && pivotData.props.cols.length !== 0
                                  ? 2
                                  : 1}
                            style:padding-left={useCompactRows
                                ? `calc(var(--pvt-row-padding, 5px) + ${j} * var(--pvt-row-indent, 20px))`
                                : null}
                            onclick={clickable && rowKey[j] ? (_) => fold([rowKey.slice(0, j + 1)]) : null}
                        >
                            {txt}
                        </th>
                    {/if}
                {/each}
                {#if !useCompactRows && rowGap}
                    <th class="pvtRowLabel" colSpan={rowGap + 1}>
                        {"Total (" + rowKey[rowKey.length - 1] + ")"}
                    </th>
                {/if}

                {#each colKeys as colKey, j (`pvtVal${i}-${j}`)}
                    {@const aggregator = pivotData.getAggregator(rowKey, colKey)}
                    {@const colGap = pivotData.props.cols.length - colKey.length}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <td
                        class={"pvtVal" + (colGap ? " pvtLevel" + colGap : "")}
                        onclick={getClickHandler && getClickHandler(aggregator.value(), rowKey, colKey)}
                        style={colGap || rowGap ? "" : valueCellColors(rowKey, colKey, aggregator.value())}
                    >
                        {aggregator.format(aggregator.value())}
                    </td>
                {/each}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <td
                    class="pvtTotal"
                    onclick={getClickHandler && getClickHandler(totalAggregator.value(), rowKey, [null])}
                    style={colTotalColors(totalAggregator.value())}
                >
                    {totalAggregator.format(totalAggregator.value())}
                </td>
            </tr>
        {/each}
        <tr>
            <th
                class="pvtTotalLabel"
                colSpan={pivotData.props.rows.length + (pivotData.props.cols.length === 0 ? 0 : 1)}
            >
                Totals
            </th>

            {#each colKeys as colKey, i (`total${i}`)}
                {@const totalAggregator = pivotData.getAggregator([], colKey)}
                {@const colGap = pivotData.props.cols.length - colKey.length}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <td
                    class={"pvtTotal" + (colGap ? " pvtLevel" + colGap : "")}
                    onclick={getClickHandler && getClickHandler(totalAggregator.value(), [null], colKey)}
                    style={rowTotalColors(totalAggregator.value())}
                >
                    {totalAggregator.format(totalAggregator.value())}
                </td>
            {/each}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <td
                onclick={getClickHandler && getClickHandler(grandTotalAggregator.value(), [null], [null])}
                class="pvtGrandTotal"
            >
                {grandTotalAggregator.format(grandTotalAggregator.value())}
            </td>
        </tr>
    </tbody>
</table>
