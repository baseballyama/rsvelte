<script lang="ts">
    import { onMount } from "svelte";
    import { getSort } from "../Utilities";
    import DraggableAttribute from "./DraggableAttribute.svelte";
    import sortableAttachment from "./SortableAttachment";

    let { items, onChange, attrValues, sorters, menuLimit } = $props();

    const options = {
        group: "shared",
        ghostClass: "pvtPlaceholder",
        filter: ".pvtFilterBox",
        preventOnFilter: false,
        revertOnSpill: true, // Enable plugin
        removeOnSpill: false, // Disable plugin
    };

    function getAttrValues(x: string) {
        const values = attrValues[x] ?? {},
            sorter = getSort(sorters, x);
        return Object.keys(values).sort(sorter);
    }

    let initialized: boolean = $state(false);
    onMount(() => {
        // onMount is afer the attachments
        initialized = true;
    });
</script>

<!-- this is removed after init -->
{#if !initialized}
    <div {@attach sortableAttachment(options, onChange)}></div>
{/if}

{#each items as name}
    <DraggableAttribute attrValues={getAttrValues(name)} {name} {menuLimit} />
{/each}
