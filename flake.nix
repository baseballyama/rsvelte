{
  description = "rsvelte — high-performance Rust port of the Svelte compiler";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    fenix = {
      url = "github:nix-community/fenix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, flake-utils, fenix }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };

        # Match CI: rsvelte builds on stable Rust (edition 2024 + rust-version 1.90
        # are both stable since 1.85). `nix flake update` advances the channel
        # when a newer stable lands; flake.lock pins the exact build for everyone.
        rustToolchain = with fenix.packages.${system};
          combine [
            stable.cargo
            stable.clippy
            stable.rust-analyzer
            stable.rust-src
            stable.rustc
            stable.rustfmt
            targets.wasm32-unknown-unknown.stable.rust-std
          ];
      in
      {
        devShells.default = pkgs.mkShell {
          packages = [
            rustToolchain

            # Node + pnpm — pinned via nixpkgs revision in flake.lock
            pkgs.nodejs_22
            pkgs.pnpm

            # WASM tooling (used by the optional `wasm` feature)
            pkgs.wasm-pack
            pkgs.binaryen        # wasm-opt

            # Native build deps. jemalloc + napi-rs link against system libs;
            # `pkg-config` lets cargo find them in the Nix store.
            pkgs.pkg-config
            pkgs.openssl

            # Misc dev tooling
            pkgs.git
            pkgs.cargo-watch
            pkgs.cargo-nextest
          ] ++ pkgs.lib.optionals pkgs.stdenv.isDarwin [
            # macOS frameworks needed by some native crates (sourcemap, etc.)
            pkgs.libiconv
            pkgs.darwin.apple_sdk.frameworks.SystemConfiguration
            pkgs.darwin.apple_sdk.frameworks.CoreServices
          ];

          # Quiet down a few common Rust + Node ergonomics issues.
          env = {
            # Use rust-src from the Nix-provided toolchain for rust-analyzer.
            RUST_SRC_PATH = "${rustToolchain}/lib/rustlib/src/rust/library";
            # Avoid pnpm trying to install Node — use the one from nixpkgs.
            PNPM_HOME = "$HOME/.local/share/pnpm";
          };

          shellHook = ''
            echo "rsvelte dev shell"
            echo "  $(rustc --version)"
            echo "  node $(node --version)"
            echo "  pnpm $(pnpm --version)"
            echo ""
            echo "First-time setup:"
            echo "  git submodule update --init --recursive"
            echo "  git config core.hooksPath .githooks"
            echo "  pnpm install"
            echo "  pnpm run generate-fixtures"
          '';
        };

        # `nix fmt` runs nixpkgs-fmt across .nix files.
        formatter = pkgs.nixpkgs-fmt;
      });
}
