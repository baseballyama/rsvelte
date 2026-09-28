<script lang="ts">
  import { CustomLine, type CustomComponentProps } from '$lib/index.js'

  type Props = CustomComponentProps<
    string,
    'string',
    // extra props
    { showString?: boolean }
  >

  let { value, showString = true, ...rest }: Props = $props()

  let isColor = $derived(value.startsWith('#'))
</script>

<CustomLine {value} {...rest} type={isColor ? '' : 'string'}>
  {#if isColor}
    <div class="color" style="background-color: {value};" title={value}>
      {#if showString}
        <div class="text">{value}</div>
      {/if}
    </div>
  {:else}
    <span class="value string">'{value}'</span>
  {/if}
</CustomLine>

<style>
  .color {
    margin-inline: 0.25em;
    outline: 1px solid var(--_border-color);
    border-radius: 2px;
    padding-inline: 1ch;
    min-width: 56px;
    height: 1.4em;
    font-size: 10px;
    line-height: 1.4;
    text-align: center;

    .text {
      mix-blend-mode: difference;
      color: hotpink;
    }
  }
</style>
