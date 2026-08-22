<script>
	let o = $state(1);
	const pr = Promise.resolve(2);
</script>

{#each [1, 2] as $i, $n}{$i}{$n}{/each}
{#each [{ a: 1 }] as { a: $a }}{$a}{/each}

{#snippet $s($p)}{@const $c = $p}<b>{$c}</b>{/snippet}
{@render $s(o)}

<div>
	{#each [3] as $d}{@const $e = $d}{$e}{/each}
</div>

{#if o}{@const $f = o}{$f}{/if}

{#await pr then $v}{$v}{:catch $err}{$err}{/await}

{[1].map(($m) => $m).join('')}
