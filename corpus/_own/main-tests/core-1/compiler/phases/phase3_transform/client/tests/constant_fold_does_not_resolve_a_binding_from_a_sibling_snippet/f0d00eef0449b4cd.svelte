<svelte:boundary>
    {#snippet children()}
        {@const foo = 'bar'}
    {/snippet}

    {#snippet failed()}
        {foo}
    {/snippet}
</svelte:boundary>