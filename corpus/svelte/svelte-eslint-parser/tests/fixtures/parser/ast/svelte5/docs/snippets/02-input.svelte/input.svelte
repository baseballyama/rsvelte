{#snippet figure({ src, caption, width, height })}
	<figure>
		<img alt={caption} {src} {width} {height} />
		<figcaption>{caption}</figcaption>
	</figure>
{/snippet}
