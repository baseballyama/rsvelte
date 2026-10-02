<script lang="ts">
  import { getPreviewLevel } from '../contexts.js'
  import { useOptions } from '../options.svelte.js'
  import type { TypeViewProps } from '../types.js'
  import { stringify } from '../util.js'
  import Expandable from './Expandable.svelte'
  import Highlight from './Highlight.svelte'
  import Node from './Node.svelte'
  import OneLineView from './OneLineView.svelte'
  import StringValue from './StringValue.svelte'

  let { value = '', key, type, path, showKey, ...rest }: TypeViewProps<string> = $props()

  const previewLevel = getPreviewLevel()
  const options = useOptions()

  let isMultiLine = $derived(value.includes('\n'))

  let parsedValue = $derived.by(() => {
    const canBeValidJSON = value.startsWith('{') || value.startsWith('[')

    if (options.value.parseJson && canBeValidJSON) {
      try {
        const p = JSON.parse(value)
        return p as Record<string, unknown> | unknown[]
      } catch {
        return
      }
    }
    return
  })

  const IMAGE_EXTENSIONS = ['.gif', '.png', '.svg', '.jpg', '.jpeg', '.webp']
  const AUDIO_EXTENSIONS = ['.mp3', '.ogg', '.wav']

  let isUrl = $derived(URL.canParse(value) || value.startsWith('/'))
  let isImageUrl = $derived(
    (IMAGE_EXTENSIONS.some((extension) => value.endsWith(extension)) && isUrl) ||
      value.startsWith('data:image')
  )
  let isAudioUrl = $derived(
    AUDIO_EXTENSIONS.some((extension) => value.endsWith(extension)) && isUrl
  )
</script>

{#if parsedValue}
  <Node
    value={parsedValue}
    path={path?.toSpliced(path.length - 1)}
    {key}
    {...rest}
    note={{ title: 'json', description: 'This value was parsed from a JSON string' }}
  />
{:else if (isMultiLine || ((isImageUrl || isAudioUrl) && options.value.embedMedia)) && !previewLevel}
  <Expandable
    {...{ value, key, type, path, showKey }}
    length={value.length}
    keepPreviewOnExpand
    {...rest}
  >
    {#snippet valuePreview({ showPreview })}
      {#if showPreview}
        <StringValue {value} />
      {/if}
    {/snippet}
    {#if isImageUrl && options.value.embedMedia}
      <div class="embed">
        <div class="image">
          <img alt={key!.toString()} src={value} style="height: 100%" />
        </div>
      </div>
    {:else if isAudioUrl && options.value.embedMedia}
      <div class="embed">
        <audio controls src={value}></audio>
      </div>
    {:else if isMultiLine}
      <pre class="value string multi" title={value}><Highlight {value} fields={['value']} /></pre>
    {/if}
  </Expandable>
{:else}
  <!-- OneLineView should be more performant in nested preview mode as it has less initial logic -->
  <OneLineView
    {showKey}
    {key}
    {type}
    {path}
    {value}
    length={value.length}
    title={stringify(value)}
    {...rest}
  >
    <StringValue {value} />
  </OneLineView>
{/if}

<style>
  .embed {
    padding: 1em;
  }

  .image {
    width: 100px;
    height: 100px;
    overflow: scroll;
    resize: both;
  }

  img {
    image-rendering: pixelated;
    object-fit: contain;
  }
</style>
