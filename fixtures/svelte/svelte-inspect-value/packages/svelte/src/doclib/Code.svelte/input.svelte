<script lang="ts">
  import Copy from '$doclib/icons/Copy.svelte'
  import Inspect from '$lib/Inspect.svelte'
  import { getContext, type Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  import { fly } from 'svelte/transition'
  import { highlight } from './shiki.js'

  type CodeProps = {
    children?: Snippet
    code: string
    label?: string
    language?: 'svelte' | 'css' | 'javascript'
  } & HTMLAttributes<HTMLDivElement>

  let { code, label = 'example', language = 'svelte', children, ...rest }: CodeProps = $props()

  const multi = getContext<boolean | undefined>('multi')

  let highlighted = $derived(children ? undefined : highlight(code, language))

  let copied = $state(false)
  let timeout: number | undefined
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
      copied = true
      if (timeout) window.clearTimeout(timeout)
      timeout = window.setTimeout(() => {
        copied = false
      }, 5000)
    } catch (e) {
      console.error(e)
      copied = false
    }
  }
</script>

<svelte:boundary>
  {#snippet failed(error, reset)}
    <Inspect value={error} />
    <button onclick={reset}>retry</button>
  {/snippet}
  <div class="code" class:multi {...rest}>
    <div class="util">
      {#if label}
        <div class="label">{label}</div>
      {/if}
      <button class:copied onclick={copyCode} title="copy code"><Copy /></button>
    </div>

    {#if children}
      {@render children()}
    {:else}
      {#await highlighted}
        ...
      {:then result}
        <div in:fly={{ x: -10 }}>
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html result}
        </div>
      {/await}
    {/if}
  </div>
</svelte:boundary>

<style>
  .code {
    position: relative;
    border: 1px solid var(--docs-border-color);
    border-radius: 8px;
    background-color: var(--bg-code);
    padding: 1em;
    overflow: hidden;
    font-size: 12px;

    :global .shiki {
      border: none;
    }
  }

  .code.multi {
    border-top-left-radius: 0;

    .label {
      display: none;
      opacity: 0;
    }
  }

  .util {
    /* color: var(--fg); */
    display: flex;
    position: absolute;
    top: 0;
    right: 0;
    flex-direction: row;
    align-items: center;
    gap: 0.5em;
    z-index: 10;
    border-bottom: 1px solid var(--docs-border-color);
    border-left: 1px solid var(--docs-border-color);
    border-radius: 0 8px 0 8px;
    background-color: var(--bg-lighter);
    padding-inline: 0.5em;
    padding-block: 0.25em;
    font-size: 14px;
    font-size: 12px;
    font-family: monospace;

    button {
      transition: all 250ms linear;
      border: none;
      padding: 0;
      width: 1em;
      height: 1em;

      &.copied {
        color: var(--green);
      }

      &:hover {
        background-color: transparent;
      }
    }
  }
</style>
