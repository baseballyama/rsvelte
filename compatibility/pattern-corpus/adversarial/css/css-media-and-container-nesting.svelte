<div class="a"><span class="b">b</span></div>

<style>
  @media screen {
    @media (min-width: 1px) {
      @supports (display: grid) {
        @container (min-width: 1px) {
          .a {
            color: red;
          }
        }
      }
    }
  }

  @media (width >= 1px) and (width <= 9999px) {
    .b {
      color: blue;
    }
  }

  @media not all and (monochrome) {
    .a {
      color: green;
    }
  }

  @media (prefers-color-scheme: dark), print {
    .b {
      color: teal;
    }
  }

  @layer a {
    @layer b {
      .a .b {
        color: olive;
      }
    }
  }
</style>
