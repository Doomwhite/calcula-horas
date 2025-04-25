{
  description = "A Nix flake for the calcula-horas Node.js script";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        nodejs = pkgs.nodejs_20; # Explicitly use nodejs_20 to avoid EOL issues

        # Define the package using mkDerivation
        calcula-horas = pkgs.stdenv.mkDerivation {
          pname = "calcula-horas";
          version = "1.2.0";
          
          src = ./.;
          
          buildInputs = [ nodejs ];
          
          buildPhase = ''
            # Ensure the script is executable
            chmod +x index.js
          '';
          
          installPhase = ''
            mkdir -p $out/bin
            cp index.js $out/bin/calcula-horas
            chmod +x $out/bin/calcula-horas
            
            # Patch the shebang to use the specified Node.js
            sed -i '1s|#!/usr/bin/env node|#!${nodejs}/bin/node|' $out/bin/calcula-horas
          '';
          
          meta = with pkgs.lib; {
            description = "Script to calculate remaining work time for an 8h48m workday";
            homepage = "https://github.com/DooMWhite/calcula-horas";
            license = licenses.mit;
            maintainers = [ "DooMWhite" ];
          };
        };
      in
      {
        packages.default = calcula-horas;
        
        apps.default = {
          type = "app";
          program = "${calcula-horas}/bin/calcula-horas";
        };
        
        devShells.default = pkgs.mkShell {
          buildInputs = [ nodejs ];
          shellHook = ''
            echo "Development environment ready. Run 'node index.js' to test."
          '';
        };
      }
    );
}
