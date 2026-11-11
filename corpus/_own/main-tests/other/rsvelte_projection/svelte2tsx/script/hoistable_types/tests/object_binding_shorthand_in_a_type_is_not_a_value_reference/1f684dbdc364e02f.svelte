<script lang="ts">
  type Props = {
    title: string
    textFactory: ({ title }: { title: string }) => string
  }
  const { title, textFactory }: Props = $props();
</script>
