{#each xs as post, i}
  {@const show_comma = post.authors.length > 2 && i < post.authors.length - 1}
{/each}
