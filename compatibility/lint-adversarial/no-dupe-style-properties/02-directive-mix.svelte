<script>
  let c = 'red';
</script>

<div style:color={c} style="color: blue">directive+attr dupe</div>
<div style="color: blue" style:color={c}>attr+directive dupe</div>
<div style:color={c} style:background="x" style="background: y">two dupes across kinds</div>
