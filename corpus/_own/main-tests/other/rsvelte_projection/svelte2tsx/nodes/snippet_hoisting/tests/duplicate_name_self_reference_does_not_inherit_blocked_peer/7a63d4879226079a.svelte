<script module>export const value = 1;</script>
<script>let local = 1;</script>
{#snippet same()}{local}{/snippet}
{#snippet same()}{@render same()}{/snippet}