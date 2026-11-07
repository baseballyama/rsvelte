<script>
	async function getRandomNumber() {
		const res = await fetch(`tutorial/random-number`);
		const text = await res.text();

		if (res.ok) {
			return text;
		} else {
			throw new Error(text);
		}
	}

	let promise = getRandomNumber();

	function handleClick() {
		promise = getRandomNumber();
	}
</script>

<button on:click={handleClick}>
	generate random number
</button>

<!-- replace this element -->
{#await promise}
	<p>...waiting</p>
{:then number}
	<p>The number is {number}</p>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}

{#await promise then value}
	<p>the value is {value}</p>
{/await}

{#await promise catch error}
	<p style="color: red">{error.message}</p>
{/await}

{#await promise then value}
	<p>the value is {value}</p>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}

