{#snippet failed(error, reset)}
    <button onclick={reset}>oops! try again</button>
{/snippet}

<svelte:boundary {failed}>...</svelte:boundary>
