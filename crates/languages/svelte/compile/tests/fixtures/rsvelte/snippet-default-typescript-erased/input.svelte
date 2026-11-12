<script lang="ts">
	let obj: any;
	let n = $state(1);
</script>
{#snippet s(p = obj!, q = n as number, r = <string>"x")}{p}{q}{r}{/snippet}
{@render s()}
