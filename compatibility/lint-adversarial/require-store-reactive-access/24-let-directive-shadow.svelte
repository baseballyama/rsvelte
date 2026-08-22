<script>
	import { writable } from 'svelte/store';
	import Wrapper from './Wrapper.svelte';

	const s = writable(0);
</script>

<Wrapper let:s>
	<p>{s + 1}</p>
</Wrapper>

<Wrapper let:other>
	<p>{s + other}</p>
</Wrapper>
