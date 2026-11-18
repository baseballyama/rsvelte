{#await promise}
    <p>x</p>
{:then value}
    <slot a={value} />
{:catch err}
    <p>{err}</p>
{/await}
