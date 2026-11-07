{#if visible}
	<p
		transition:fly="{{ y: 200, duration: 2000 }}"
		on:introstart="{() => status = 'intro started'}"
		on:outrostart="{() => status = 'outro started'}"
		on:introend="{() => status = 'intro ended'}"
		on:outroend="{() => status = 'outro ended'}"
	>
		Flies in and out
	</p>
{/if}
