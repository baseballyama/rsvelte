<svelte:boundary>{#snippet pending()}<p>Loading</p>{/snippet}{#snippet failed(error, reset)}<p>{error.message}</p><button onclick={reset}>Retry</button>{/snippet}<p>Ready</p></svelte:boundary>
