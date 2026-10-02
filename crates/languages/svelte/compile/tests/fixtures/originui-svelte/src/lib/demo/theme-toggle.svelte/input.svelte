<script lang="ts">
	import RiMoonClearLine from '~icons/ri/moon-clear-line';
	import RiSunLine from '~icons/ri/sun-line';
	import { mode, setMode } from 'mode-watcher';

	function handleModeChange() {
		if ($mode === 'light') {
			setMode('dark');
		} else {
			setMode('light');
		}
	}
</script>

<div class="flex flex-col justify-center">
	<input
		type="checkbox"
		name="theme-toggle"
		id="theme-toggle"
		class="peer sr-only"
		checked={$mode === 'light'}
		onchange={handleModeChange}
		aria-label="Toggle dark mode"
	/>
	<label
		class="text-muted-foreground peer-focus-visible:outline-ring/70 relative inline-flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-solid"
		for="theme-toggle"
		aria-hidden="true"
	>
		<RiSunLine class="size-5 dark:hidden" aria-hidden="true" />
		<RiMoonClearLine class="hidden size-5 dark:block" aria-hidden="true" />
		<span class="sr-only">Switch to light / dark version</span>
	</label>
</div>
