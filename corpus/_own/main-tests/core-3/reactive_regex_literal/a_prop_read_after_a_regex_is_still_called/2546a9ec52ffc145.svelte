<script>
  export let src;
  $: isUrl = typeof src === 'string' && /^(https?:)?\/\//i.test(src);
</script>

<p>{isUrl}</p>
