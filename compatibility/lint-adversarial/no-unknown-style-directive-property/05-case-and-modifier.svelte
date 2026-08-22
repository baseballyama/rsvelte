<script>
  let v = '1';
</script>

<div style:COLOR="red">uppercase not in known set, flag</div>
<div style:Color="red">titlecase flag</div>
<div style:--UPPER-CUSTOM="x">custom always ok</div>
<div style:unknowncased|important={v}>modifier with unknown, flag</div>
<div style:opacity|important={v}>modifier with known, ok</div>
