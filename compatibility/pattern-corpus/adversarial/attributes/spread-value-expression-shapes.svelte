<script>
  let v = $state(1);

  function make() {
    return { "data-made": v };
  }

  const table = { row: { "data-row": v } };
  const list = [{ "data-list": v }];
</script>

<div {...make()}>a</div>
<div {...table.row}>b</div>
<div {...list[0]}>c</div>
<div {...{ inline: v }}>d</div>
<div {...v ? make() : {}}>e</div>
<div {...make() ?? {}}>f</div>
<div {...Object.assign({}, make())}>g</div>
