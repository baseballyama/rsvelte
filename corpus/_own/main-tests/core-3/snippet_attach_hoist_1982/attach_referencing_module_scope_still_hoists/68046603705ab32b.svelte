<script>
	import { onRendered } from './attachments.js';
	let count = $state(0);
</script>

{#snippet warning()}
	<li {@attach onRendered}>x</li>
{/snippet}

<p>{count}</p>
{@render warning()}