<script module>export const value = 1;</script>
{#snippet recursive(n)}{#if n}{@render recursive(n - 1)}{/if}{/snippet}