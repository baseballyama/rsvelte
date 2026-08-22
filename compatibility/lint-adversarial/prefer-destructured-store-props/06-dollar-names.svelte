<script>
	import { writable } from 'svelte/store';

	const _ = writable({ t: (k) => k });
</script>

<p>{$$props.cls}</p>
<p>{$$restProps.x}</p>
<p>{$_.t('hello')}</p>
