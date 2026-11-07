<script lang="ts">
  import { untrack } from 'svelte'
  import { fade } from 'svelte/transition'
  import { useOptions } from '../options.svelte.js'
  import type { TypeViewProps } from '../types.js'
  import Entry from './Entry.svelte'
  import Expandable from './Expandable.svelte'
  import Node from './Node.svelte'
  import Preview from './Preview.svelte'

  type Props = TypeViewProps<Promise<unknown>>

  let { value = Promise.resolve(), key, type, path, ...rest }: Props = $props()
  const options = useOptions()
  let status = $state<'pending' | 'fulfilled' | 'rejected'>('pending')
  let result = $state<unknown>(undefined)
  let currentPromise = $state<Promise<unknown>>()
  let expandable = $state<Expandable>()

  let entries = $derived(
    Object.entries({
      state: status,
      result: result,
    })
  )

  function handleSuccess(res: unknown, promise: Promise<unknown>) {
    if (promise === value) {
      result = res
      if (status !== 'fulfilled') {
        status = 'fulfilled'
        expandable?.flash()
      }
    }
  }

  function handleReject(err: unknown, promise: Promise<unknown>) {
    if (promise === value) {
      result = err
      status = 'rejected'
      expandable?.flash()
    }
  }

  function resolvePromise(promise: Promise<unknown>) {
    status = 'pending'
    result = undefined
    try {
      promise
        .then(
          (res) => handleSuccess(res, promise),
          (e) => handleReject(e, promise)
        )
        .catch((e) => handleReject(e, promise))
    } catch (err) {
      handleReject(err, promise)
    }
  }

  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    value
    untrack(() => {
      if (currentPromise !== value) {
        currentPromise = value
        resolvePromise(value)
      }
    })
  })
</script>

<Expandable
  bind:this={expandable}
  {...{ value, key, type, path }}
  length={entries.length}
  showLength={false}
  {...rest}
>
  {#snippet valuePreview({ showPreview })}
    {#key status}
      <span class="value promise {status}" in:fade={{ duration: options.transitionDuration }}>
        <span class="bracket">&lt;</span>
        {`${status}`}
        {#if status === 'fulfilled' || status === 'rejected'}
          <Preview
            {showPreview}
            prefix=":"
            singleValue={{ value: result }}
            startLevel={0}
            showKey={false}
            style="gap:0"
            bracketStyle="margin: 0; font-weight: bold"
          />
        {/if}
        <span class="bracket">&gt;</span>
      </span>
    {/key}
  {/snippet}
  {#each entries as [key, value], i (key)}
    <Entry {i}>
      <Node {value} {key} {path} />
    </Entry>
  {/each}
</Expandable>

<style>
  span.value {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 0;

    &.rejected {
      color: var(--_promise-rejected-color);
    }
    &.pending {
      color: var(--_promise-pending-color);
    }
    &.fulfilled {
      color: var(--_promise-fulfilled-color);
    }
  }

  .bracket {
    color: var(--_promise-bracket-color);
    font-weight: bold;
  }
</style>
