<script lang="ts">
    import { setContext } from "svelte";
    import PivotData from "./PivotData";
    import PivotTable from "./PivotTable.svelte";
    import TableRenderers from "./TableRenderers";
    import Aggregators from "./UI/Aggregators.svelte";
    import DnDCell from "./UI/DnDCell.svelte";
    import Dropdown from "./UI/Dropdown.svelte";
    import MainTable from "./UI/MainTable.svelte";
    import { aggregators as defaultAggregators, sortAs } from "./Utilities";
    import type { PivotTableUIProps, FilterSet } from "./types";

    let {
        rendererName = "Table",
        renderers = TableRenderers,
        aggregatorName = "Count",
        aggregators = defaultAggregators,
        hiddenAttributes = [],
        hiddenFromAggregators = [],
        hiddenFromDragDrop = [],
        unusedOrientationCutoff = 85,
        menuLimit = 500,

        // pivotData props managed by PivotTableUI
        derivedAttributes = PivotData.defaultProps.derivedAttributes,
        cols = PivotData.defaultProps.cols,
        rows = PivotData.defaultProps.rows,
        vals = PivotData.defaultProps.vals,
        sorters = PivotData.defaultProps.sorters,

        compactRows = true,
        // pivot data
        data,

        ...restProps
    }: PivotTableUIProps = $props();

    let valueFilter: FilterSet = $state({});
    setContext<FilterSet>("valueFilter", valueFilter);

    let unusedOrder: string[] = $state.raw([]);

    const notHidden = (e: string) => !hiddenAttributes.includes(e) && !hiddenFromDragDrop.includes(e);

    let colAttrs = $derived(cols.filter(notHidden));
    let rowAttrs = $derived(rows.filter(notHidden));

    let attrValues: Record<string, Record<string, number>> = $derived.by(() => {
        let attrValues: Record<string, Record<string, number>> = {};

        let recordsProcessed = 0;

        PivotData.forEachRecord(data ?? [], derivedAttributes, function (record: Record<string, any>) {
            for (const attr of Object.keys(record)) {
                if (!(attr in attrValues)) {
                    attrValues[attr] = {};
                    if (recordsProcessed > 0) {
                        attrValues[attr].null = recordsProcessed;
                    }
                }
            }
            for (const attr in attrValues) {
                const value: string = attr in record ? record[attr] : "null";
                if (!(value in attrValues[attr])) {
                    attrValues[attr][value] = 0;
                }
                attrValues[attr][value]++;
            }
            recordsProcessed++;
        });
        return attrValues;
    });

    let unusedAttrs: string[] = $derived(
        Object.keys(attrValues)
            .filter((e) => !colAttrs.includes(e) && !rowAttrs.includes(e) && notHidden(e))
            .sort(sortAs(unusedOrder)),
    );

    let horizUnused: boolean = $derived.by(() => {
        const unusedLength = unusedAttrs.reduce((r, e) => r + e.length, 0);
        return unusedLength < unusedOrientationCutoff;
    });

    let valAttrs: string[] = $derived(
        Object.keys(attrValues).filter(
            (e) => !hiddenAttributes.includes(e) && !hiddenFromAggregators.includes(e),
        ),
    );

    const firstKey = (x: object) => Object.keys(x)[0];

    let renderer = $derived(
        renderers[
            (rendererName in renderers ? rendererName : firstKey(renderers)) as keyof typeof renderers
        ],
    );

    let aggregator = $derived(
        aggregators[
            (aggregatorName in aggregators
                ? aggregatorName
                : firstKey(aggregators)) as keyof typeof aggregators
        ],
    );
</script>

<MainTable {horizUnused}>
    {#snippet rendererCell()}
        <Dropdown bind:current={rendererName} values={Object.keys(renderers)} />
    {/snippet}

    {#snippet aggregatorCell()}
        <Aggregators
            {aggregatorName}
            {aggregators}
            {valAttrs}
            onChange={(v: string) => (aggregatorName = v)}
            onUpdate={(v: string[]) => (vals = v)}
            {vals}
        />
    {/snippet}

    {#snippet unusedAttrsCell()}
        <DnDCell
            {sorters}
            {attrValues}
            items={unusedAttrs}
            onChange={(v: string[]) => (unusedOrder = v)}
            {menuLimit}
        />
    {/snippet}

    {#snippet colAttrsCell()}
        <DnDCell
            {sorters}
            {attrValues}
            items={colAttrs}
            onChange={(v: string[]) => (cols = v)}
            {menuLimit}
        />
    {/snippet}

    {#snippet rowAttrsCell()}
        <DnDCell
            {sorters}
            {attrValues}
            items={rowAttrs}
            onChange={(v: string[]) => (rows = v)}
            {menuLimit}
        />
    {/snippet}

    {#snippet outputCell()}
        <PivotTable
            {renderer}
            {...restProps}
            {cols}
            {rows}
            {vals}
            {derivedAttributes}
            {aggregator}
            {data}
            {sorters}
            {compactRows}
            {valueFilter}
            {aggregatorName}
            {aggregators}
        />
    {/snippet}
</MainTable>
