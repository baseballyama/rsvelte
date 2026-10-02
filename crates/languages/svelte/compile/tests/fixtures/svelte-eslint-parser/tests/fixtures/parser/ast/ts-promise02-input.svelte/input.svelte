<script lang="ts">
</script>

{#await Promise.resolve(1)}
	<p>...waiting</p>
{:then number}
	<p>The number is {number}</p>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}


{#await Promise.resolve(1)}
	{#await Promise.resolve('str')}
		<p>...waiting</p>
	{:then s}
		<p>The string is {s}</p>
	{:catch error}
		<p style="color: red">{error.message}</p>
	{/await}
{:then number}
	<p>The number is {number}</p>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}

{#await Promise.resolve(true)}
	<p>...waiting</p>
{:then b}
	<p>The boolean is {b}</p>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}

{#await Promise.resolve(1)}
	<p>...waiting</p>
{:then number}
	<p>The number is {number}</p>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}

{#await Promise.resolve(1)}
	<p>...waiting</p>
{:then number}
	<p>The number is {number}</p>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}

{#await Promise.resolve(1)}
	<p>...waiting</p>
{:then number}
	<p>The number is {number}</p>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}

{#await Promise.resolve(1)}
	<p>...waiting</p>
{:then number}
	<p>The number is {number}</p>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
