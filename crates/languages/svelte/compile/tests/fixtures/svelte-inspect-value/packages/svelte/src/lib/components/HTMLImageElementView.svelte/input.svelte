<script lang="ts">
  import { useOptions } from '../options.svelte.js'
  import type { TypeViewProps } from '../types.js'
  import HtmlView from './HTMLView.svelte'

  type Props = TypeViewProps<HTMLImageElement>

  let { value, ...rest }: Props = $props()

  let options = useOptions()
</script>

<HtmlView {value} {...rest}>
  {#if value.src && options.value.embedMedia}
    <div class="image">
      <img alt={value.alt} src={value.src} />
    </div>
  {/if}
</HtmlView>

<style>
  .image {
    width: 100px;
    height: 100px;
    overflow: scroll;
    resize: both;
  }

  img {
    object-fit: contain;
  }
</style>
