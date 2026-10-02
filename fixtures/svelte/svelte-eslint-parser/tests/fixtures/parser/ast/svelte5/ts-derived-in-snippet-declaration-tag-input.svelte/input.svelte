<script lang="ts"></script>

{#snippet derivedConst()}
  {const x = $derived(0)}
  <p>{x}</p>
{/snippet}

{@render derivedConst()}
