<script>
  let v = $state("a");
  const obj = { "data-x": 1 };
</script>

<b title={`a${"}"}b`}>1</b>
<b title="{v}}">2</b>
<b title="{'{'}{v}">3</b>
<b data-json={JSON.stringify({ a: "}" })}>4</b>
<b {...obj} title={v}>5</b>
<b title={v}>6</b>
<b title={v}>7</b>
