<script>
  let v = '1px';
</script>

<div style:color="red">known ok</div>
<div style:colr="red">unknown flag</div>
<div style:margin-inline-start={v}>known logical ok</div>
<div style:--custom-prop="red">custom property ok</div>
<div style:--x={v}>short custom ok</div>
<div style:unknown-thing={v}>unknown flag</div>
