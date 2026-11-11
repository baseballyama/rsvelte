<script>
  let markup = $state('<b>bold</b><i>italic</i>');
</script>

<button class="change" onclick={() => (markup = '<p>changed &amp; escaped</p>')}>change</button>
<button class="clear" onclick={() => (markup = '')}>clear</button>
<section>before {@html markup} after</section>
