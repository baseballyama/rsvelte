<script>
	const BASE = { CHECK: 'checkbox' };
	const SPREAD = { ...BASE, RADIO: 'radio' };
	const NESTED = { inner: { kind: 'checkbox' } };
	const LIST = ['checkbox', 'radio'];
	const MUTATED = { CHECK: 'checkbox' };
	MUTATED.CHECK = 'text';
	const GETTER = {
		get CHECK() {
			return 'checkbox';
		}
	};
	let v = '';
</script>

<input type={SPREAD.CHECK} bind:value={v} />
<input type={SPREAD.RADIO} bind:value={v} />
<input type={NESTED.inner.kind} bind:value={v} />
<input type={LIST[0]} bind:value={v} />
<input type={LIST[1]} bind:value={v} />
<input type={MUTATED.CHECK} bind:value={v} />
<input type={GETTER.CHECK} bind:value={v} />
<input type={LIST.missing} bind:value={v} />
