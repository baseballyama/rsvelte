{#snippet row(src)}
	<!-- svelte-ignore a11y_missing_attribute -->
	<img {src} />
{/snippet}
{#snippet unused_row(src)}
	<!-- svelte-ignore a11y_missing_attribute -->
	<img {src} alt="ok" />
{/snippet}
{@render row('a.png')}
{@render unused_row('b.png')}
