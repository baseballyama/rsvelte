<script lang="ts">
  interface Props {
    /** アバターのコンテンツ */
    content: 'image' | 'initial' | 'count';
    /** 画像のソース (content='image' の場合に必須) */
    imageSrc?: string;
  }
  const { content, imageSrc }: Props = $props();
</script>
<p>{content}{imageSrc}</p>
