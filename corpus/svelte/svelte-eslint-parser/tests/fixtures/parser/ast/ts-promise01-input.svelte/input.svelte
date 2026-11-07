<script lang="ts">
	let promise:Promise<{a:number}> = new Promise((resolve)=>resolve({a:42}));
</script>

{#await promise}
	<p>...waiting</p>
{:then number}
	<p>The number is {number.a}</p>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}