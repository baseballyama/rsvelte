<script>
  let big = true;
  let size = '2rem';
  let color = 'red';
</script>

<div style:--track-color="red">custom property directive flag</div>
<div style:font-size|important={size}>important modifier flag</div>
<div style:color>shorthand style directive flag</div>
<span class:big>class directive is not style, ok</span>
