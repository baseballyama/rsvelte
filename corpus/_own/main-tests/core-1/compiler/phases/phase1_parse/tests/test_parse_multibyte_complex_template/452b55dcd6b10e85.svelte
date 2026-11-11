<script lang="ts">
  interface Props {
    /** アバター */
    content: 'image' | 'initial';
    size?: string;
  }
  const { content, size = 's' }: Props = $props();
  const px = $derived.by(() => size === 'xs' ? 20 : 32);
</script>

<div class="avatar" style:width={`${px}px`} style:height={`${px}px`}>
  {#if content === 'image'}
    <span>img</span>
  {:else}
    <div style:width="100%" style:height="100%">init</div>
  {/if}
</div>
