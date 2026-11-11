<script module>export const value = 1;</script>
<script>let local = 1;</script>
{#snippet first()}{@render second()}{/snippet}
{#snippet second()}{@render third()}{/snippet}
{#snippet third()}{local}{/snippet}