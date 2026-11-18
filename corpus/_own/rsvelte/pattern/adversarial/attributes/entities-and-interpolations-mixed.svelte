<script>
  let n = $state(1);
  let text = $state("t");
</script>

<div title="&amp; {n} &lt; {text} &gt;">a</div>
<div title="{n}&nbsp;{text}">b</div>
<div data-a="&#65;{n}&#x42;">c</div>
<a href="/a?b={n}&amp;c={text}">d</a>
<a href="/a?b={n}&c={text}">e</a>
<div aria-label="&quot;{text}&quot;">f</div>
<div title="&apos;{text}&apos;">g</div>
<div title="100&percnt; {n}">h</div>
