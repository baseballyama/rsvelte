<script>
	let o = { 0x10: 1, [0b11]: 2, 0o17: 3, 1_000: 4, 1e-7: 5, 0x1fn: 6, .5: 7 };
	let { 0x10: a, 1e3: b, 1_000: c, ...rest } = $props();
	let m = o.x ?? 0xff;
	let xs = [];
</script>

{a}{b}{c}{m}{rest}
{#each xs as x}{@const { 0x10: d } = x}{d}{/each}
