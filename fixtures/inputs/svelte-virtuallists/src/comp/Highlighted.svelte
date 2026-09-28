<script lang="ts">
  // Based on https://github.com/metonym/svelte-highlight/blob/master/src/LangTag.svelte
  let { lang, highlighted }: { lang: string; highlighted: string } = $props();
</script>

<pre data-language={lang}><code class="hljs">{@html highlighted}</code></pre>
