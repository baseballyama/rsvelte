<script>
	let x = 1;
	let o = { k: 1 };
	let items = [{}];
</script>

{#snippet neg(p = -1)}<span>{p}</span>{/snippet}
{#snippet pos(p = +1)}<span>{p}</span>{/snippet}
{#snippet negf(p = -1.5)}<span>{p}</span>{/snippet}
{#snippet not(p = !0)}<span>{p}</span>{/snippet}
{#snippet bnot(p = ~0)}<span>{p}</span>{/snippet}
{#snippet voided(p = void 0)}<span>{p}</span>{/snippet}
{#snippet typed(p = typeof 1)}<span>{p}</span>{/snippet}
{#snippet ident(p = -x)}<span>{p}</span>{/snippet}
{#snippet condu(p = x ? -1 : 2)}<span>{p}</span>{/snippet}
{#snippet binu(p = 1 + -2)}<span>{p}</span>{/snippet}
{#snippet logu(p = x || -1)}<span>{p}</span>{/snippet}

{#snippet plain(p = 1)}<span>{p}</span>{/snippet}
{#snippet cond(p = x ? 1 : 2)}<span>{p}</span>{/snippet}
{#snippet member(p = o.k)}<span>{p}</span>{/snippet}

{@render neg()}{@render pos()}{@render negf()}{@render not()}{@render bnot()}
{@render voided()}{@render typed()}{@render ident()}{@render condu()}
{@render binu()}{@render logu()}{@render plain()}{@render cond()}{@render member()}

{#each items as { a = -1, b = x ? -1 : 2, c = 1, d = o.k }}
	<span>{a}{b}{c}{d}</span>
{/each}
