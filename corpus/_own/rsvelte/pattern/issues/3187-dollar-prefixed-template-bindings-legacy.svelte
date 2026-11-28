<script>
	export let o = 1;
	const pr = Promise.resolve(2);
</script>

{#each [1, 2] as $i, $n}{$i}{$n}{/each}

{#snippet $s($p)}{@const $c = $p}<b>{$c}</b>{/snippet}
{@render $s(o)}

{#await pr then $v}{$v}{:catch $err}{$err}{/await}
