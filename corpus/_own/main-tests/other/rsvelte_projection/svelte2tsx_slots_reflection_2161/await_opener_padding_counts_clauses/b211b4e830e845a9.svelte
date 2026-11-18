{#await promise then value}
    <slot a={value} />
{:catch err}
    <p>{err}</p>
{/await}
