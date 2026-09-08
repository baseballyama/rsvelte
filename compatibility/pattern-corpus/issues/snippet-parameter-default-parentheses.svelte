<script>
	let obj = { a: { b: 1 } };
	let a = 1, b = 2, c = 3, x = 4, y = 5;
</script>

{#snippet bare(p = obj.a)}<span>{p}</span>{/snippet}
{#snippet lit(p = 1)}<span>{p}</span>{/snippet}
{#snippet unary(p = -1)}<span>{p}</span>{/snippet}
{#snippet cond(p = obj.a ? 1 : 2)}<span>{p}</span>{/snippet}

{#snippet nested(p = obj.a ? (obj.a ? 1 : 2) : 3)}<span>{p}</span>{/snippet}
{#snippet seq(p = (obj.a, obj.a))}<span>{p}</span>{/snippet}
{#snippet one(p = (obj.a))}<span>{p}</span>{/snippet}
{#snippet two(p = ((obj.a)))}<span>{p}</span>{/snippet}
{#snippet litp(p = (1))}<span>{p}</span>{/snippet}
{#snippet arrowp(p = (() => 1))}<span>{p}</span>{/snippet}
{#snippet condp(p = (a ? 1 : 2))}<span>{p}</span>{/snippet}
{#snippet logic(p = a ?? (b || c))}<span>{p}</span>{/snippet}
{#snippet seq3(p = (a, b, c))}<span>{p}</span>{/snippet}
{#snippet arr(p = [1, (2, 3)])}<span>{p}</span>{/snippet}
{#snippet obji(p = { k: (1, 2) })}<span>{p}</span>{/snippet}
{#snippet assign(p = (a = 1))}<span>{p}</span>{/snippet}
{#snippet memb(p = (obj.a).b)}<span>{p}</span>{/snippet}
{#snippet memb2(p = (obj).a)}<span>{p}</span>{/snippet}
{#snippet arrow(p = (x) => (y))}<span>{p}</span>{/snippet}
{#snippet typeo(p = typeof (a))}<span>{p}</span>{/snippet}

{@render bare()}{@render lit()}{@render unary()}{@render cond()}
{@render nested()}{@render seq()}{@render one()}{@render two()}
{@render litp()}{@render arrowp()}{@render condp()}{@render logic()}
{@render seq3()}{@render arr()}{@render obji()}{@render assign()}
{@render memb()}{@render memb2()}{@render arrow()}{@render typeo()}
