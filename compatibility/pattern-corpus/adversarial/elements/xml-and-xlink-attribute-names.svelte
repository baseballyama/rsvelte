<script>
  let href = $state("#a");
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
  <use xlink:href={href} />
  <a xlink:title="t" xlink:show="new" href="#b">
    <text xml:lang="en" xml:space="preserve">a b</text>
  </a>
  <foreignObject width="1" height="1">
    <div xmlns="http://www.w3.org/1999/xhtml">c</div>
  </foreignObject>
</svg>

<div xml:lang="ja" data-x="1">d</div>
