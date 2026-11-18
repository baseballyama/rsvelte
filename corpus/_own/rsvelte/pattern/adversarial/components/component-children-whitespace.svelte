<script>
	import Wrap from './Wrap.svelte';

	let n = $state(1);
</script>

<Wrap>
	{n}
</Wrap>
<Wrap>{n}</Wrap>
<Wrap> </Wrap>
<Wrap>
	text before
	<em>{n}</em>
	text after
</Wrap>
<Wrap>{#if n}{n}{/if}</Wrap>
