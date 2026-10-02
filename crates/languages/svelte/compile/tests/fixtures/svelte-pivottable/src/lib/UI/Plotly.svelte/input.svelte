<script module lang="ts">
    let Plotly: any = $state();

    export function initPlotly(module: any) {
        Plotly = module;
    }
</script>

<script lang="ts">
    // export const onUpdate = () => {}; // TODO: connect to plotly events
    let { data, layout, config, onUpdate } = $props();

    function create(node: HTMLElement) {
        if (Plotly) {
            Plotly.newPlot(node, data, layout, config);
            return () => Plotly.purge(node);
        }
    }
</script>

{#if Plotly}
    <div {@attach create}></div>
{:else}Add commentMore actions
    <p>Error! Plotly.js not initialized.</p>
{/if}
