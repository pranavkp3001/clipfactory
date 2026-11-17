# Clip Factory

Campaign-first clipping operations dashboard. Built as an orchestration layer around OpenShorts.

Status: initial repository setup. Application files are being added next.

## OpenShorts API foundation

Server routes now exist for starting jobs, checking job status, and receiving HMAC-verified completion webhooks. The quick-start panel calls the server-side process route and asks for a rights confirmation. Campaigns are cached in the browser's local storage.

Before processing can work, configure the server-side variables listed in [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md). Persistent database writes, authentication, automated campaign submissions, and analytics sync are not yet complete.
