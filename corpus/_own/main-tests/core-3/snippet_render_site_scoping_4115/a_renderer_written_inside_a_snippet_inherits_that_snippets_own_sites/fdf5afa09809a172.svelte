{#snippet inner()}<span>x</span>{/snippet}
{#snippet outer()}{@render inner()}{/snippet}
<div class="wrap">{@render outer()}</div>
<style>.wrap span { color: red; }</style>
