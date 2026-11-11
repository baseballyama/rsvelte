<script>
  let rel = 'noopener noreferrer';
  let extra = 'nofollow';
</script>

<a href="https://example.com/" target="_blank" rel={rel}>dynamic rel, flag</a>
<a href="https://example.com/" target="_blank" rel="noopener {extra}">flag: noreferrer missing</a>
<a href="https://example.com/" target="_blank" rel="noopener {extra} noreferrer">literal parts secure</a>
<a href="https://example.com/" target="_blank" rel="noopener&#10;noreferrer">entity newline separator</a>
<a href="https://example.com/" target="_blank" rel>valueless rel, flag</a>
<a href="https://example.com/" target="_blank" rel="">empty rel, flag</a>
