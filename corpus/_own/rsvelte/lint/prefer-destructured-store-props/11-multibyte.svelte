<script>
	import { writable } from 'svelte/store';

	const 店 = writable({ 名: 'a' });
</script>

<p>こんにちは、{$店.名}!</p>
