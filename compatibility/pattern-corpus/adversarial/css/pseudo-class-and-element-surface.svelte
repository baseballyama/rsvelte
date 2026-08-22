<ul class="list">
  <li>a</li>
  <li>b</li>
</ul>
<input class="field" placeholder="p" />
<dialog class="sheet">c</dialog>

<style>
  .list li:first-child {
    color: red;
  }

  .list li:last-child {
    color: blue;
  }

  .list li:nth-child(2n + 1) {
    color: green;
  }

  .list li:nth-last-child(odd) {
    color: teal;
  }

  .list li:only-child {
    color: olive;
  }

  .list:not(.empty, .hidden) {
    color: navy;
  }

  .list:has(li) {
    color: maroon;
  }

  .field:focus-visible,
  .field:focus-within,
  .field:disabled,
  .field:enabled,
  .field:required,
  .field:optional,
  .field:read-only,
  .field:placeholder-shown {
    color: purple;
  }

  .list li::before {
    content: "•";
  }

  .list li::after {
    content: "";
  }

  .list li::first-line {
    color: silver;
  }

  .field::placeholder {
    color: gray;
  }

  .list li::marker {
    color: black;
  }

  .sheet::backdrop {
    background: rgb(0 0 0 / 50%);
  }

  .list ::selection {
    background: yellow;
  }
</style>
