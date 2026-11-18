<script>
	import { writable } from 'svelte/store';
	import Wrapper from './Wrapper.svelte';

	const foo = writable({});
	function log(v) {
		return v;
	}
	function go() {}
</script>

<!-- `key` in the interpolation is NOT the inner-block binding -->
<button
	onclick={() => {
		const v = $foo[`k${key}`];
		{
			const key = 1;
			log(key);
		}
		return v;
	}}>a</button
>

<!-- `key` here IS the catch parameter -->
<button
	onclick={() => {
		try {
			go();
		} catch (key) {
			log($foo[`k${key}`]);
		}
	}}>b</button
>

<!-- `slotKey` is bound by the let: directive -->
<Wrapper let:slotKey>
	<p>{$foo[`k${slotKey}`]}</p>
</Wrapper>
