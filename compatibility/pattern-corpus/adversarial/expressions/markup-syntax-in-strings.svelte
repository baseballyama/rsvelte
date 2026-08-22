<script>
	let show = $state(true);
	const closer = '</div>';
	const block = '{#if fake}{/if}';
	const render = '{@render nope()}';
</script>

<div>{'</div>'}</div>
<p>{closer}{block}{render}</p>
<!-- comment holding {#if} {:else} {/if} and </p> -->
{#if show}
	<span>{'{:else}'}</span>
{/if}

{#each [{ brace: '{' }, { brace: '}' }] as o}
	<b>{o.brace}</b>
{/each}
