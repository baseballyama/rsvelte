<script lang="ts">
  import { type Snippet } from 'svelte'
  import type { TypeViewProps } from '../types.js'
  import { isArray, isObject } from '../util.js'
  import { htmlState } from '../util/mutation-observer.svelte.js'
  import Expandable from './Expandable.svelte'
  import GetterSetter from './GetterSetter.svelte'
  import HtmlValue from './HTMLValue.svelte'
  import Node from './Node.svelte'
  import PropertyList from './PropertyList.svelte'

  type Props = TypeViewProps<HTMLElement> & { children?: Snippet }

  let { value, key = undefined, path, children, ...rest }: Props = $props()

  // svelte-ignore state_referenced_locally TODO
  let element = htmlState(value)
  let current = $state({
    scrollLeft: 0,
    scrollTop: 0,
    clientHeight: 0,
    clientWidth: 0,
  })

  $effect(() => {
    const onscroll = (event: Event) => {
      const target = event.target as HTMLElement
      current.scrollLeft = target.scrollLeft
      current.scrollTop = target.scrollTop
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      current.clientHeight = entry.target.clientHeight
      current.clientWidth = entry.target.clientWidth
      current.scrollLeft = entry.target.scrollLeft
      current.scrollTop = entry.target.scrollTop
    })

    if (value) {
      value.addEventListener('scroll', onscroll)
      resizeObserver.observe(value)
    }

    return () => {
      value.removeEventListener('scroll', onscroll)
      resizeObserver.disconnect()
    }
  })

  $effect(() => {
    if (value && value !== element.ele) {
      element.destroy()
      element = htmlState(value)
    }
  })

  let attrs = $derived.by(() => {
    if (element.ele) {
      return Object.entries(element.ele.attributes ?? {})
        .map(([, attr]) => [attr.name, attr.value])
        .filter(([name]) => !['class', 'style', 'data'].includes(name) && !name.startsWith('data-'))
    }
    return []
  })

  let styles = $derived.by(() => {
    if (element.ele) {
      const elementStyle = element.ele.style
      const out: [string, string][] = []
      for (const prop in elementStyle) {
        if (Object.hasOwn(elementStyle, prop) && !Number.isNaN(Number.parseInt(prop))) {
          const value = elementStyle.getPropertyValue(elementStyle[prop])
          if (value)
            out.push([elementStyle[prop], elementStyle.getPropertyValue(elementStyle[prop])])
        }
      }
      return out
    }
    return []
  })

  let entries = $derived(
    Object.entries({
      ...Object.fromEntries(attrs),
      class: element.ele.className?.split(' ').filter(Boolean) ?? [],
      styles: Object.fromEntries(styles),
      data: Object.fromEntries(Object.entries(element.ele.dataset ?? {})),
      ...current,
      children: value.children,
      value: (value as HTMLInputElement).value,
    }).filter(([, v]) =>
      isArray(v) ? v.length : isObject(v) ? Object.entries(v).length : v != null
    )
  )
</script>

<Expandable {...{ value, key, path }} length={entries.length} keepPreviewOnExpand {...rest}>
  {#snippet valuePreview()}
    {#key value}
      <HtmlValue {value} />
    {/key}
  {/snippet}
  {#if children}
    {@render children()}
  {/if}
  <PropertyList keys={entries.map((e) => e[0])} {value}>
    {#snippet item({ key, descriptor })}
      {#if (key === 'children' || key === 'value') && (descriptor?.get || descriptor?.set)}
        <GetterSetter {value} {descriptor} {key} {path} />
      {:else}
        <Node value={entries.find((e) => e[0] === key)?.[1]} {key} {path} />
      {/if}
    {/snippet}
  </PropertyList>
</Expandable>
