<script lang="ts">
	export let p = 1;
	let n = 0;
	$: doubled = p * 2;
</script>

<b on:click={() => n++}>{n}{doubled}</b>
