<script lang="ts">
  interface Props {
    /** あ */
    content: string;
  }
  const { content }: Props = $props();
</script>

<div style:width="100%">{content}</div>