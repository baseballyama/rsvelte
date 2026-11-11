<script lang="ts">let obj: any; let q: any;</script>
{#snippet s(p = obj.a ?? (obj.b ?? 1))}{p}{/snippet}
{@render s()}
