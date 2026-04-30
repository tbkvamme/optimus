← [Tech Stack](../tech-stack.md)

# Observability

Application logging, request tracing, and how operational visibility lands in Datadog. Plus the boundary between application logs and audit logs.

## Current State

Pre-implementation. The patterns are locked at this level of detail; concrete code lands in the implementation plan.

## Application logging: Serilog

Serilog is wired in `Program.cs` as the default logger:

- **Sinks**:
  - Production: `Console` with the JSON formatter (`CompactJsonFormatter` or equivalent). Structured JSON to stdout is what the DigitalOcean log forwarder consumes.
  - Development: `Console` with the human-readable template formatter. Same logger, different formatter.
- **Enrichers**:
  - `FromLogContext` — picks up properties added via `LogContext.PushProperty`.
  - `WithMachineName`, `WithThreadId`, `WithEnvironmentName` — operational context.
  - Custom `CorrelationIdEnricher` — adds the per-request correlation ID (see below).

## Correlation IDs

A `CorrelationIdMiddleware` runs early in the ASP.NET pipeline:

1. Reads `X-Correlation-ID` from the incoming request header.
2. If absent, generates a new GUID.
3. Sets it on `HttpContext.Items` and pushes it into Serilog's `LogContext`.
4. Echoes it back in the `X-Correlation-ID` response header.

Every log line for a request is automatically tagged with the correlation ID. Outbound HTTP calls (e.g., to a lender adapter) propagate the same header so a single ID traces a request across systems.

## Request logging: `UseSerilogRequestLogging`

The Serilog request-logging middleware emits one structured log entry per HTTP request: method, path, status code, elapsed time, plus enriched properties (correlation ID, authenticated user ID, real client IP from the `DO-Connecting-IP` header DO App Platform injects).

This is the canonical "what happened in this request" log entry; lower-level handler logs add detail under the same correlation ID.

## MediatR `LoggingBehavior`

A pipeline behavior wraps every MediatR command/query handler:

- Logs the request type name on entry.
- Times the handler.
- Logs the elapsed milliseconds and outcome (success / exception type) on exit.

Useful for spotting slow handlers without instrumenting each one by hand. Combined with the request log, every API call has at least two correlated entries: the HTTP-layer summary and the application-handler timing.

## Forwarding to Datadog

DigitalOcean App Platform has built-in log forwarding to Datadog:

- The app writes structured JSON to stdout — no Datadog SDK in the application code.
- DO collects stdout from the running container and forwards entries to Datadog using the Datadog API key (stored as a DO secret).
- Datadog ingests the JSON, parses the structured fields, and indexes them for search.

The decoupling matters: if Datadog goes away tomorrow, the app keeps logging; we point DO's forwarder somewhere else (or a different sink picks up the stdout stream).

## The audit-log boundary

**Application logs** (Serilog → Datadog) are for debugging and operations:
- Useful for incident response, performance investigation, error triage.
- Default retention is whatever Datadog's plan provides (typically 15 days).
- May contain PII transiently in error contexts; we redact known-sensitive fields where practical.

**Audit logs** are a different concern, driven by [compliance.md](../compliance.md):
- Records compliance-relevant events: every outbound lender call, every consent capture, every funding-gate transition, every authorization issuance for a borrower.
- Stricter retention (multi-year, per regulatory requirements TBD with the business team).
- Structured rows in the application database, not log lines — queryable, joinable, exportable for regulator requests.
- Written via dedicated handlers, not via `ILogger` calls. Audit-log writes are part of the same DB transaction as the event being audited.

In short: app logs answer "what just happened in the system?", audit logs answer "can we prove what happened, when, and to whom?". They share correlation IDs but live in different stores.

The audit-log schema and retention specifics are owed to a future KB topic once compliance / retention requirements land from the business team.

## Key Decisions & Rationale

### Datadog via DO log forwarding, not via a Datadog .NET library

**Why:** No app dependency on a vendor SDK. Stdout JSON is portable; switching providers is a DO config change, not a code release. Application code stays unaware of where its logs end up.

**How to apply:** Don't add `Datadog.Trace`, `Datadog.Logs`, or similar libraries to the .NET solution unless we're explicitly buying APM features the log-forwarder approach can't provide.

### Audit log is not application log

**Why:** Mixing the two creates two failure modes: compliance events lost in log retention rotation, or operational logs over-retained for compliance reasons. Each has its own data shape, retention need, and access control. Keeping them separate is cleaner and cheaper.

**How to apply:** When designing a feature, ask "is this a compliance event?" If yes, write a structured row through a dedicated audit-log path. If no, an `ILogger` call is fine.

### Correlation IDs propagated outbound

**Why:** A lender's webhook callback should join up to the original outbound call we made. Propagating the correlation ID via the `X-Correlation-ID` header lets us reconstruct cross-system flows in Datadog without a distributed-tracing system.

**How to apply:** Any outbound HTTP client built in Optimus inherits the correlation ID from the current context. Lender adapters in particular MUST honor this.

## Known Limitations

- Datadog APM (distributed tracing, flame graphs, span-level instrumentation) is **not** in the initial setup. If we need it later, the upgrade path is well-trodden but adds the SDK dependency we're avoiding here.
- Log redaction for PII is a discipline, not a tool. Each new field added to log context should be reviewed for sensitivity.
- Audit-log infrastructure is a follow-up KB topic; the current entry establishes the boundary but not the schema.

## Deferred / Future

- Custom Datadog dashboards (per-endpoint latency, lender-call success rates, funnel from prequal to funded). Out-of-the-box dashboards are sufficient initially.
- Alerting policies (paging on error-rate spikes, slow handlers, lender-adapter failures). Set up when we have enough live traffic for thresholds to be meaningful.
- Metrics emission (counters, histograms via `System.Diagnostics.Metrics` or OpenTelemetry). Not in MVP.
- APM tracing.
- Audit-log schema, retention policy, and export tooling.

## Cross-References

See also: [tech-stack.md](../tech-stack.md), [compliance.md](../compliance.md), [infrastructure-and-deployment.md](infrastructure-and-deployment.md), [application-architecture.md](application-architecture.md), [adapter-architecture.md](../lender-integration-model/adapter-architecture.md).
