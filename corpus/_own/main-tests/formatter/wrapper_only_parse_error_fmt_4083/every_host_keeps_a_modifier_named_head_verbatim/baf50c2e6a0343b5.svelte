<script lang="ts">
	let accessor: any;
	let declare: any;
	let readonly: any;
	let type: any;
	let value: any;
</script>

{#snippet t(q)}{q}{/snippet}{@render t(accessor satisfies string)}
