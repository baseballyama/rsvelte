<script>
  let path = $state("/a");
</script>

<a href="/a">1</a>
<a href="https://example.com/a?b=1#c">2</a>
<a href="mailto:a@example.com">3</a>
<a href="tel:+1234567890">4</a>
<a href="#anchor">5</a>
<a href="?query=1">6</a>
<a href={path}>7</a>
<a href="{path}?x=1">8</a>
<a href="//example.com">9</a>
<a href="data:text/plain,hello">10</a>
<img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="d" />
<form action="/submit?a=1" method="post"><button>11</button></form>
