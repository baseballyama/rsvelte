<script lang="ts">
  import { type Readable, type Writable } from 'svelte/store'
  import { useOptions } from '../options.svelte.js'
  import type { TypeViewProps } from '../types.js'
  import { getAllProperties, isValidStore, type ValueType } from '../util.js'
  import Expandable from './Expandable.svelte'
  import GetterSetter from './GetterSetter.svelte'
  import Node from './Node.svelte'
  import ObjectView from './ObjectView.svelte'
  import Preview from './Preview.svelte'
  import PropertyList from './PropertyList.svelte'

  type Props = TypeViewProps<Readable<unknown> | Writable<unknown>>

  let { value, key = undefined, type, path = [], ...rest }: Props = $props()

  const options = useOptions()

  let { stores: storeMode } = $derived(options.value)

  const valueKey = Symbol('store-value')

  let namedConstructor = $derived(
    value.constructor.name !== 'Object' ? value.constructor.name : false
  )

  let storeType = $derived(
    typeof (value as Writable<unknown>).set === 'function' ? 'writable' : 'readable'
  )
  let valueType = $derived(namedConstructor ? (namedConstructor as ValueType) : storeType)
  let keys = $derived([valueKey, ...getAllProperties(value)])

  let validStore = $derived(isValidStore(value))
</script>

{#if validStore}
  {#if storeMode === 'full' || storeMode === true}
    <Expandable type={valueType} length={keys.length} {key} {path} {value} {...rest}>
      {#snippet valuePreview({ showPreview })}
        <Preview
          style="margin-left: -0.5em"
          showKey={false}
          singleValue={{ value: $value }}
          prefix="("
          postfix=")"
          startLevel={0}
          bracketStyle="color: var(--_comment-color)"
          {showPreview}
        />
      {/snippet}
      <PropertyList {keys} {value} {type}>
        {#snippet item({ key, descriptor })}
          {#if descriptor?.get || descriptor?.set}
            <GetterSetter {value} {descriptor} {key} {path} />
          {:else if key === valueKey}
            <Node
              key="value"
              keyPrefix="$"
              keyStyle="--_text-color: var(--_comment-color); gap: 0;"
              value={$value}
              path={[...path, Symbol('$')]}
            />
          {:else}
            <Node value={value[key as keyof typeof value]} {key} {path} />
          {/if}
        {/snippet}
      </PropertyList>
    </Expandable>
  {:else if storeMode === 'value-only'}
    <Node
      {key}
      path={path?.toSpliced(path.length - 1)}
      value={$value}
      {...rest}
      note={{ title: 'store', description: 'Value was retrieved by subscribing to a store' }}
    />
  {/if}
{:else}
  <ObjectView
    note={{
      title: 'invalid store',
      description:
        'Subscribe function did not return a valid subscriber.\nReverted to default object view.',
    }}
    {value}
    {key}
    type="object"
    {path}
    {...rest}
  />
{/if}
