<script>
    let a = 1;
    let b = 2;
</script>

{#snippet show(x, y)}
    <span>{x}-{y}</span>
{/snippet}

{@render show(
    a,
    b,
)}