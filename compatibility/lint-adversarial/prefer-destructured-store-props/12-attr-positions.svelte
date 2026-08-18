<script>
	import { writable } from 'svelte/store';

	const foo = writable({ cls: 'x', fn: () => {}, attrs: {} });
</script>

<div class={$foo.cls} on:click={$foo.fn} {...$foo.attrs} title="pre {$foo.cls} post">t</div>
<input class:active={$foo.cls} style:color={$foo.cls} />
