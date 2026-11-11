<script module lang="ts">
export const m = <K>(k: K) => k;
</script>
<script lang="ts">
const id = <T>(x: T): T => x;
const pair = <T, U>(a: T, b: U) => [a, b];
const bounded = <T extends string>(x: T) => x;
const safe = <T,>(x: T) => x;
const raw: unknown = 1;
const n = <number>raw;
</script>
<p>{id(1)}{pair(1, 2)}{bounded('a')}{safe(1)}{m(1)}{n}</p>
<p>{(<V>(v: V) => v)(1)}{<string>raw}</p>
{#snippet row<R>(r: R)}<i>{String(r)}</i>{/snippet}