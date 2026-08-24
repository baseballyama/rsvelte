<script>
  let n = $state(1);
</script>

<template>
  <b>inside a template</b>
</template>

<slot-lookalike>a</slot-lookalike>
<noscript><b>b</b></noscript>
<output for="x">{n}</output>
<progress value={n} max="10"></progress>
<meter value={n} min="0" max="10"></meter>
<data value={String(n)}>c</data>
<time datetime="2026-01-01">d</time>
<ruby>漢<rt>kan</rt>字<rt>ji</rt></ruby>
<bdi>e</bdi>
<bdo dir="rtl">f</bdo>
<ins datetime="2026-01-01">g</ins>
<del cite="/c">h</del>
<figure><figcaption>i</figcaption></figure>
<hgroup>
  <h1>j</h1>
  <p>k</p>
</hgroup>
<search><input type="search" /></search>
