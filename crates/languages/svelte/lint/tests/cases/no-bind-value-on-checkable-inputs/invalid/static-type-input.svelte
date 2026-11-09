<script lang="ts">
	let t = 'checkbox';
	const types = { choice: 'radio' };
	const kind = 'CHECK';
	let a = $state(''), b = $state(''), c = $state(''), d = $state(''), e = $state(''), f = $state('');
</script>

<input type={t} bind:value={a} />
<input type={'radio' as const} bind:value={b} />
<input type={types.choice} bind:value={c} />
<input type={kind.toLowerCase() + 'box'} bind:value={d} />
<input type={t ? 'radio' : 'text'} bind:value={e} />
<input type={`${'radio'}`} bind:value={f} />
