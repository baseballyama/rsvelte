<div class="host">a</div>
<ol class="list">
  <li>b</li>
</ol>

<style>
  @charset "utf-8";

  @font-face {
    font-family: "Ranged";
    src: local("Arial");
    unicode-range: U+0000-00FF, U+0131, U+0152-0153;
  }

  @counter-style circled {
    system: fixed;
    symbols: "①" "②";
    suffix: " ";
  }

  @font-feature-values "Ranged" {
    @styleset {
      nice: 1;
    }
  }

  @namespace svg url("http://www.w3.org/2000/svg");

  .list {
    list-style: circled;
  }

  .host {
    font-family: "Ranged", sans-serif;
    font-variant-alternates: styleset(nice);
  }
</style>
