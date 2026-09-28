<script lang="ts">
  // Props
  interface Props {
    visible: boolean;
  }

  let { visible }: Props = $props();

  // Generate timestamp for iframe URL to prevent caching
  const timestamp = Date.now();
</script>

{#if visible}
  <div class="py-4">
    <iframe
      src={`/kite_map.html?timestamp=${timestamp}`}
      class="h-[calc(100vh-200px)] w-full border-none"
      title="World news map"
      loading="lazy"
    ></iframe>
  </div>
{/if}
