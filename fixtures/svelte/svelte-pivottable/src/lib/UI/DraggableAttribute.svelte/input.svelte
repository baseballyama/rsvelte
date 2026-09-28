<script lang="ts">
    import { getContext } from "svelte";
    import Draggable from "./Draggable.svelte";
    import FilterBox from "./FilterBox.svelte";

    let { name, attrValues, menuLimit } = $props();

    let open = $state(false);

    let valueFilter = getContext<Record<string, object>>("valueFilter");
    let is_empty = $derived(valueFilter[name] ? Object.keys(valueFilter[name]).length === 0 : true);

    const toggleOpen = () => (open = !open);
</script>

<li data-id={name} class="handle">
    <span class={`pvtAttr ${is_empty ? "" : "pvtFilteredAttribute"}`}>
        {name}
        <span class="pvtTriangle" onclick={toggleOpen} onkeypress={toggleOpen} role="presentation">
            {" "}
            ▾
        </span>
    </span>

    {#if open}
        <Draggable handle=".pvtDragHandle" close=".pvtCloseX" onclose={toggleOpen}>
            <FilterBox {name} values={attrValues} {menuLimit} />
        </Draggable>
    {/if}
</li>
