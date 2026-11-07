{#snippet figure(image)}
	<figure>
		<img
			src={image.src}
			alt={image.caption}
			width={image.width}
			height={image.height}
		/>
		<figcaption>{image.caption}</figcaption>
	</figure>
{/snippet}

{#each images as image}
	{#if image.href}
		<a href={image.href}>
			{@render figure(image)}
		</a>
	{:else}
		{@render figure(image)}
	{/if}
{/each}
