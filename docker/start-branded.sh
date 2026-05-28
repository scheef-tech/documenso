#!/bin/sh
# Branded-Documenso entrypoint.
#
# Sources the brand's cert identity (baked in at image build by
# Dockerfile.branded → /etc/brand-cert.env) before handing off to the upstream
# start.sh. Per-deploy env (DB URL, SMTP, encryption keys) still comes from
# the container's environment as usual.
set -eu

if [ -f /etc/brand-cert.env ]; then
  . /etc/brand-cert.env
fi

exec sh /app/apps/remix/start.sh
