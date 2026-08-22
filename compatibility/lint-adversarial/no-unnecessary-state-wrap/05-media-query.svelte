<script>
	import { MediaQuery } from 'svelte/reactivity';
	const mq = $state(new MediaQuery('(min-width: 600px)'));
</script>

{mq.current}
