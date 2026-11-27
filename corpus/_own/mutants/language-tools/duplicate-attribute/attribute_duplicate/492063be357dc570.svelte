<svelte:boundary onerror={e => e} onerror={e => e}>
    <ComponentThatFails />
    {#snippet failed(e)}
        <p>error: {e}</p>
    {/snippet}
</svelte:boundary>
