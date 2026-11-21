<script lang="ts">
	const p = Promise.resolve(1);
</script>

{#if true}<p>{await p}</p>{/if}
