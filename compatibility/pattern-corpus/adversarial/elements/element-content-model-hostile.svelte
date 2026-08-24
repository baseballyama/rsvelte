<script>
  let v = $state("x");
</script>

<table>
  <caption>c</caption>
  <colgroup><col /></colgroup>
  <thead>
    <tr><th scope="col">{v}</th></tr>
  </thead>
  <tbody>
    <tr><td>{v}</td></tr>
  </tbody>
  <tfoot>
    <tr><td>{v}</td></tr>
  </tfoot>
</table>

<dl>
  <dt>{v}</dt>
  <dd>{v}</dd>
</dl>

<details open>
  <summary>{v}</summary>
  <p>{v}</p>
</details>

<figure>
  <picture>
    <source srcset="a.avif" type="image/avif" />
    <img src="a.png" alt={v} />
  </picture>
  <figcaption>{v}</figcaption>
</figure>
