<script>
	function ok($) {
		return $;
	}
	const arrow = ($$a) => $$a;
	function caught() {
		try {
			return 0;
		} catch ($) {
			return $;
		}
	}
</script>

<b>{ok(1)}{arrow(2)}{caught()}</b>

{#each [1] as $}{$}{/each}
{#each [2] as $$x}{$$x}{/each}
{#snippet s($$p)}<i>{$$p}</i>{/snippet}
{@render s(3)}
