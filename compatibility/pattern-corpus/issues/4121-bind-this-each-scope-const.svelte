<script>
	let els = [];
	let items = $state([1, 2, 3]);
	let offs = [0, 1, 2];
	let total = $derived(1);
</script>

<!-- declared in the each block's own scope: becomes a callback parameter -->
{#each items as item, i}
	{@const k = offs[i]}
	<span bind:this={els[k]}>a</span>
{/each}

<!-- declared one {#if} deeper: a different scope, so it stays a signal read -->
{#each items as item, i}
	{#if item}
		{@const k = offs[i]}
		<span bind:this={els[k]}>b</span>
	{/if}
{/each}

<!-- declared in the each, used deeper: the declaration's scope is what counts -->
{#each items as item, i}
	{@const k = offs[i]}
	{#if item}
		<span bind:this={els[k]}>c</span>
	{/if}
{/each}

<!-- no each block at all -->
{#if items}
	{@const k = offs[0]}
	<span bind:this={els[k]}>d</span>
{/if}

<!-- the loop variables themselves -->
{#each items as item, i}
	<span bind:this={els[i]}>e</span>
{/each}

<!-- a `$derived` from the instance scope is not collected; the `{@const}` is -->
{#each items as item, i}
	{@const k = offs[i]}
	<span bind:this={els[k + total]}>f</span>
{/each}

<!-- the subject expression's shape is a second axis: the collector walks it, so a
     `||` or a template literal must not lose the reference inside it -->
{#each items as item, i}
	{@const k = offs[i]}
	<span bind:this={els[k || 0]}>g</span>
{/each}

{#each items as item, i}
	{@const k = offs[i]}
	<span bind:this={els[`k${k}`]}>h</span>
{/each}

<!-- a property KEY is walked before its value and burns the name, so the reference
     that follows it is never collected; a key spelled differently does not burn it -->
{#each items as item, i}
	{@const k = offs[i]}
	<span bind:this={els[{ k: k }.k]}>i</span>
{/each}

{#each items as item, i}
	{@const k = offs[i]}
	<span bind:this={els[{ kk: k }.kk]}>j</span>
{/each}
