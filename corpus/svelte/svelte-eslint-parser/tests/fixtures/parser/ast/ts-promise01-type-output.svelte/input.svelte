<script lang="ts">
	let promise:Promise<{a:number}> = new Promise((resolve)=>resolve({a:42})); // promise: Promise<{ a: number; }>, Promise: PromiseConstructor, resolve: (value: { a: number; } | PromiseLike<{ a: number; }>) => void, resolve({a:42}): void
</script>

{#await promise} <!-- promise: Promise<{ a: number; }> -->
	<p>...waiting</p>
{:then number} <!-- number: { a: number; } -->
	<p>The number is {number.a}</p> <!-- number.a: number -->
{:catch error} <!-- error: Error -->
	<p style="color: red">{error.message}</p> <!-- error.message: string -->
{/await}