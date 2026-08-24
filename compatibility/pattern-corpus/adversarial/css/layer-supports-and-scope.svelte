<div class="host">
  <span class="child">a</span>
</div>

<style>
  @layer base, components;

  @layer base {
    .host {
      color: red;
    }
  }

  @layer {
    .child {
      color: blue;
    }
  }

  @layer components.nested {
    .host .child {
      color: green;
    }
  }

  @supports (display: grid) {
    .host {
      display: grid;
    }
  }

  @supports selector(:has(*)) {
    .host:has(.child) {
      color: teal;
    }
  }

  @supports not (display: contents) {
    .host {
      display: block;
    }
  }

  @supports (display: grid) and ((color: red) or (color: blue)) {
    .child {
      color: olive;
    }
  }

  @media (min-width: 100px) {
    @supports (display: grid) {
      @layer base {
        .host {
          gap: 1px;
        }
      }
    }
  }
</style>
