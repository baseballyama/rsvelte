{#await promise then value}
    <slot a={value}>Hello</slot>
{:catch err}
    <slot name="err" err={err}>Hello</slot>
{/await}
