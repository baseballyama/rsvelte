<script lang="ts">
  import { setContext, type ComponentProps } from 'svelte'
  import Code from '../Code.svelte'

  type Props = {
    examples: ComponentProps<typeof Code>[]
  }

  let { examples }: Props = $props()

  // svelte-ignore state_referenced_locally
  let currentLabel = $state(examples[0].label)
  let currentExample = $derived(examples.find((ex) => ex.label === currentLabel))

  setContext('multi', true)
</script>

<div class="examples">
  <div class="tabs">
    {#each examples as { label } (label)}
      <button class:active={currentLabel === label} onclick={() => (currentLabel = label)}>
        {label}
      </button>
    {/each}
  </div>
  {#if currentExample}
    <Code {...currentExample} />
  {/if}
</div>

<style>
  button {
    z-index: 9999;
    border-bottom: none;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
    background-color: var(--base00);
  }

  button.active {
    border-bottom: none;
    background-color: var(--bg-lighter);
  }

  .tabs {
    width: 100%;
    font-size: 14px;
  }
</style>
