<script lang="ts">
    let foo: Promise<()=>void>
</script>

{#await foo then bar}
    <button on:click={() => bar()} />
{/await}
