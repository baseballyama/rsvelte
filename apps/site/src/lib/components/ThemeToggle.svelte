<script lang="ts">
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
	class="font-mono text-[13px] tracking-normal text-muted hover:text-fg"
	onclick={toggle}
	aria-label="テーマを切り替え"
>
	<!-- Chosen by CSS so the label is right before hydration, when the inline script has set the class. -->
	<span class="dark:hidden">dark</span><span class="hidden dark:inline">light</span>
</button>
