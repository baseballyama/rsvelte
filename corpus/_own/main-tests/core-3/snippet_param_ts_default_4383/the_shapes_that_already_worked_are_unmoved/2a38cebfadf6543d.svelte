<script lang="ts">let obj: any; let q: any;</script>
{#snippet s(p = obj.a ? 1 : 2)}{p}{/snippet}
{@render s()}
