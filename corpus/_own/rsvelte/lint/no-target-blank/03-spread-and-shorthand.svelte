<script>
  let rest = { rel: 'noopener noreferrer' };
  let href = 'https://example.com/';
  let target = '_blank';
</script>

<a href="https://example.com/" target="_blank" {...rest}>rel via spread is invisible, flag</a>
<a {href} target="_blank">shorthand href dynamic, flag</a>
<a href="https://example.com/" {target}>shorthand target, not static, ok</a>
