<script>
    import { clickOutside } from "./utils";

    let { current = $bindable(), values = [], onchange = undefined } = $props();

    let open = $state(false);
    const toggle = () => (open = !open);
</script>

<div class="pvtDropdown" use:clickOutside onoutside={() => (open = false)}>
    <button onclick={toggle} class={"pvtDropdownValue pvtDropdownCurrent " + (open ? "pvtDropdownCurrentOpen" : "")}>
        <div class="pvtDropdownIcon">{open ? "×" : "▾"}</div>
        {#if current}
            {current}
        {:else}
            <span>&nbsp;</span>
        {/if}
    </button>

    {#if open}
        <div class="pvtDropdownMenu" style="z-index: 100;">
            {#each values as r (r)}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <div
                    role="button"
                    onclick={() => {
                        if (current !== r) {
                            current = r;
                            onchange?.(current);
                        }
                        toggle();
                    }}
                    class="pvtDropdownValue"
                    class:pvtDropdownActiveValue={r === current}
                    tabindex="0"
                >
                    {r}
                </div>
            {/each}
        </div>
    {/if}
</div>
