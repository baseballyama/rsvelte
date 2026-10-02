<script lang="ts">
    let a: Promise<{ x: number }>
    let b: Promise<{ x: number }>
    let c: Promise<{ x: number }>
    let d: Promise<number[]>
    let e: Promise<number[]>
</script>

{#await a}
    <div>await</div>
{:then a}
    <div>{a.x}</div>
{/await}

{#await b}
    <div>await</div>
{:then { x: b = 42 }}
    <div>{b.toExponential()}</div>
{/await}

{#await c}
    <div>await</div>
{:then {...c}}
    <div>{c.x}</div>
{/await}

{#await d}
    <div>await</div>
{:then [d]}
    <div>{d.toExponential()}</div>
{/await}

{#await e}
    <div>await</div>
{:then [...e]}
    <div>{e[0].toExponential()}</div>
{/await}
