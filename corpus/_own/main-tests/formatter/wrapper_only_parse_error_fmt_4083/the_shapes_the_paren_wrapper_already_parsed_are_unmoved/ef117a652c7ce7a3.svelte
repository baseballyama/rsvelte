<script lang="ts">
	let accessor: any;
	let declare: any;
	let readonly: any;
	let type: any;
	let value: any;
</script>

{#if 1}{@const c = type satisfies string}{c}{/if}
