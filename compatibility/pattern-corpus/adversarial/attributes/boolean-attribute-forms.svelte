<script>
  let on = $state(true);
  const off = false;
</script>

<input disabled />
<input disabled="" />
<input disabled="disabled" />
<input disabled={on} />
<input disabled={off} />
<input disabled={undefined} />
<input disabled={null} />
<input readonly required checked autofocus />
<div hidden inert></div>
<div hidden={on} inert={off}></div>
<details open><summary>a</summary></details>
<details open={on}><summary>b</summary></details>
<img src="a.png" alt="" loading="lazy" decoding="async" />
<select multiple>
  <option value="a" selected>a</option>
  <option value="b" selected={on}>b</option>
</select>
