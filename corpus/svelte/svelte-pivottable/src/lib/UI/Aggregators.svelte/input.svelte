<script lang="ts">
    import Dropdown from "./Dropdown.svelte";

    let { onChange, onUpdate, aggregatorName, aggregators, valAttrs, vals } = $props();

    let numValsAllowed = $derived(aggregators[aggregatorName]([])().numInputs || 0);

    const sortIcons = {
        key_a_to_z: {
            rowSymbol: "↕",
            colSymbol: "↔",
            next: "value_a_to_z",
        },
        value_a_to_z: {
            rowSymbol: "↓",
            colSymbol: "→",
            next: "value_z_to_a",
        },
        value_z_to_a: { rowSymbol: "↑", colSymbol: "←", next: "key_a_to_z" },
    };

    // is it a time to use array.toSpliced(index, 1, value); ?
    const setAt = (array: any[], index: number, value: any) => Object.assign([], array, { [index]: value });
</script>

<Dropdown current={aggregatorName} values={Object.keys(aggregators)} onchange={onChange} />

<!-- svelte-ignore a11y_missing_attribute -->
<!-- sorting causes problems 
    <a
    role="button"
    class="pvtRowOrder"
    onclick={() => propUpdater("rowOrder")(sortIcons[props.rowOrder].next)}
    >
    {sortIcons[props.rowOrder].rowSymbol}
</a>
-->

<!-- svelte-ignore a11y_missing_attribute -->
<!-- sorting causes problems 
<a
    role="button"
    class="pvtColOrder"
    onclick={() => propUpdater("colOrder")(sortIcons[props.colOrder].next)}
>
    {sortIcons[props.colOrder].colSymbol}
</a>
-->

{#if numValsAllowed > 0}
    <br />
{/if}

{#each new Array(numValsAllowed) as n, i (i)}
    <Dropdown current={vals[i]} values={valAttrs} onchange={(v: any) => onUpdate(setAt(vals, i, v))} />
    {#if i + 1 !== numValsAllowed}
        <br />{/if}
{/each}
