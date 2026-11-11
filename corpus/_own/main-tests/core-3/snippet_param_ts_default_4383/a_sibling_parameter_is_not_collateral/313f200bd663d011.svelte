<script lang="ts">let obj: any; let q: any;</script>
{#snippet s(q, p = <string>() => 1)}{p}{/snippet}
{@render s()}
