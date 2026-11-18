<script lang="ts">
	import Icon from './Icon.svelte';

	let dark = $state(false);

	$effect(() => {
		dark = document.documentElement.classList.contains('dark');
	});

	function toggle() {
		dark = !dark;
		document.documentElement.classList.toggle('dark', dark);
		try {
			localStorage.setItem('theme', dark ? 'dark' : 'light');
		} catch {
			// Private mode: the choice lasts for this page only.
		}
	}
</script>

<button
	type="button"
	class="flex size-8 items-center justify-center rounded-md text-fg-2 hover:bg-surface hover:text-fg"
	onclick={toggle}
	aria-label="テーマを切り替え"
	title="テーマを切り替え"
>
	<!-- Chosen by CSS so the icon is right before hydration, when the inline script has set the class. -->
	<span class="dark:hidden"><Icon name="moon" size={17} /></span><span class="hidden dark:inline"
		><Icon name="sun" size={17} /></span
	>
</button>
