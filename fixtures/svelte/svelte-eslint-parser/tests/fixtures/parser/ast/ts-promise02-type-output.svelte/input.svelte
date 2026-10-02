<script lang="ts">
</script>

{#await Promise.resolve(1)} <!-- Promise.resolve(1): Promise<number> -->
	<p>...waiting</p>
{:then number} <!-- number: number -->
	<p>The number is {number}</p> <!-- number: number -->
{:catch error} <!-- error: Error -->
	<p style="color: red">{error.message}</p> <!-- error.message: string -->
{/await}


{#await Promise.resolve(1)} <!-- Promise.resolve(1): Promise<number> -->
	{#await Promise.resolve('str')} <!-- Promise.resolve('str'): Promise<string> -->
		<p>...waiting</p>
	{:then s} <!-- s: string -->
		<p>The string is {s}</p> <!-- s: string -->
	{:catch error} <!-- error: Error -->
		<p style="color: red">{error.message}</p> <!-- error.message: string -->
	{/await}
{:then number} <!-- number: number -->
	<p>The number is {number}</p> <!-- number: number -->
{:catch error} <!-- error: Error -->
	<p style="color: red">{error.message}</p> <!-- error.message: string -->
{/await}

{#await Promise.resolve(true)} <!-- Promise.resolve(true): Promise<boolean> -->
	<p>...waiting</p>
{:then b} <!-- b: boolean -->
	<p>The boolean is {b}</p> <!-- b: boolean -->
{:catch error} <!-- error: Error -->
	<p style="color: red">{error.message}</p> <!-- error.message: string -->
{/await}

{#await Promise.resolve(1)} <!-- Promise.resolve(1): Promise<number> -->
	<p>...waiting</p>
{:then number} <!-- number: number -->
	<p>The number is {number}</p> <!-- number: number -->
{:catch error} <!-- error: Error -->
	<p style="color: red">{error.message}</p> <!-- error.message: string -->
{/await}

{#await Promise.resolve(1)} <!-- Promise.resolve(1): Promise<number> -->
	<p>...waiting</p>
{:then number} <!-- number: number -->
	<p>The number is {number}</p> <!-- number: number -->
{:catch error} <!-- error: Error -->
	<p style="color: red">{error.message}</p> <!-- error.message: string -->
{/await}

{#await Promise.resolve(1)} <!-- Promise.resolve(1): Promise<number> -->
	<p>...waiting</p>
{:then number} <!-- number: number -->
	<p>The number is {number}</p> <!-- number: number -->
{:catch error} <!-- error: Error -->
	<p style="color: red">{error.message}</p> <!-- error.message: string -->
{/await}

{#await Promise.resolve(1)} <!-- Promise.resolve(1): Promise<number> -->
	<p>...waiting</p>
{:then number} <!-- number: number -->
	<p>The number is {number}</p> <!-- number: number -->
{:catch error} <!-- error: Error -->
	<p style="color: red">{error.message}</p> <!-- error.message: string -->
{/await}
