TODO Julia behind proxy
#######################

:date: 2025-10-20
:slug: julia-config-network
:lang: en
:summary: TODO
:description: TODO
:keywords: TODO

.. code-block:: julia

   # startup.jl
   ENV["HTTP_PROXY"] = "..."
   ENV["HTTPS_PROXY"] = "..."
   ENV["JULIA_PKG_SERVER"] = "..."
   ENV["JULIA_PKG_USE_CLI_GIT"] = "..."  # Julia ≥v1.7


- https://docs.julialang.org/en/v1/manual/environment-variables/#JULIA_PKG_SERVER
- https://docs.julialang.org/en/v1/manual/environment-variables/#JULIA_PKG_USE_CLI_GIT

- https://eu-central.pkg.julialang.org/meta/siblings
- https://status.julialang.org/

- https://pkgdocs.julialang.org/v1/

.. 

  **JULIA_PKG_SERVER**
  
  Specifies the URL of the package registry to use.
  By default, Pkg uses https://pkg.julialang.org to fetch Julia packages.
  In addition, you can disable the use of the PkgServer protocol, and instead access the packages directly from their hosts (GitHub, GitLab, etc.) by setting: export JULIA_PKG_SERVER=""
  
  https://docs.julialang.org/en/v1/manual/environment-variables/#JULIA_PKG_SERVER
