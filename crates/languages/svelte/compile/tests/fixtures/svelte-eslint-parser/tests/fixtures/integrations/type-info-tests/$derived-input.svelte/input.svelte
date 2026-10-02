<script lang="ts">
    type Info = { foo: number };
    let x: Info | null = { foo: 42 };
    const get = () => "hello";

    x = null;
    const y = $derived(x);
    const z = $derived(fn(y.foo));
    const foo = $derived(get);

    function fn(a: number): number {
        return a;
    }
</script>

<input title={z} bind:value={x}>
{foo()}
