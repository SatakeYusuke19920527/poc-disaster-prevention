#!/usr/bin/env bash
# Create the AI Search index and seed sample documents.
# Requires: az login with Search Index Data Contributor + Search Service Contributor roles.
set -euo pipefail

SEARCH_NAME=${SEARCH_NAME:-srch-pocdisaster-dev-8nvp8}
SEARCH_ENDPOINT="https://${SEARCH_NAME}.search.windows.net"
API_VERSION="2024-07-01"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Acquiring AAD token for AI Search"
TOKEN=$(az account get-access-token --resource https://search.azure.com --query accessToken -o tsv)

echo "==> Checking existing index"
HTTP=$(curl -s -o /tmp/idx.json -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  "${SEARCH_ENDPOINT}/indexes/disaster-index?api-version=${API_VERSION}")

if [[ "$HTTP" == "200" ]]; then
  echo "    index exists; updating schema (PUT)"
  METHOD=PUT
elif [[ "$HTTP" == "404" ]]; then
  echo "    index missing; creating (PUT)"
  METHOD=PUT
else
  echo "    unexpected response: HTTP $HTTP"
  cat /tmp/idx.json
  exit 1
fi

echo "==> Creating/updating index"
HTTP=$(curl -s -o /tmp/idx-resp.json -w "%{http_code}" -X $METHOD \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --data @"${HERE}/seed-data/index-schema.json" \
  "${SEARCH_ENDPOINT}/indexes/disaster-index?api-version=${API_VERSION}")
if [[ "$HTTP" != "200" && "$HTTP" != "201" && "$HTTP" != "204" ]]; then
  echo "    index PUT failed: HTTP $HTTP"
  cat /tmp/idx-resp.json
  exit 1
fi
echo "    index PUT OK (HTTP $HTTP)"

echo "==> Uploading documents"
python3 - > /tmp/upload.json <<PY
import json, os
docs = json.load(open(os.path.join("${HERE}", "seed-data", "documents.json"), encoding="utf-8"))
payload = {"value": [dict(d, **{"@search.action": "mergeOrUpload"}) for d in docs]}
print(json.dumps(payload, ensure_ascii=False))
PY

curl -sf -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --data @/tmp/upload.json \
  "${SEARCH_ENDPOINT}/indexes/disaster-index/docs/index?api-version=${API_VERSION}" \
  | python3 -m json.tool | head -30

echo "==> Verifying document count (waiting 5s for indexing)"
sleep 5
curl -sf \
  -H "Authorization: Bearer $TOKEN" \
  "${SEARCH_ENDPOINT}/indexes/disaster-index/docs/\$count?api-version=${API_VERSION}"
echo
echo "==> Done."
