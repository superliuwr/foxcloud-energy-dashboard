(function attachRebuildHelpers(global) {
  function interpolate(template, values) {
    return Object.entries(values).reduce(
      (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
      template,
    );
  }

  function formatRebuildStatus(payload, translate) {
    const t = typeof translate === "function" ? translate : (key) => key;
    const rebuild = payload.rebuild ?? payload;
    const processed = Number(rebuild.processedDays ?? payload.processedDays ?? 0);
    const rebuilt = Number(rebuild.rebuiltDays ?? payload.rebuiltDays ?? 0);
    const skipped = Number(rebuild.skippedDays ?? payload.skippedDays ?? 0);
    const omitted = Number(rebuild.omittedDays ?? payload.omittedDays ?? 0);
    const limit = Number(rebuild.limitDays ?? payload.limitDays ?? 0);
    const summary = interpolate(t("rebuildSummary"), {
      processed,
      rebuilt,
      skipped,
    });
    const limited = Boolean(rebuild.limited ?? payload.limited);
    const limitedText = limited
      ? interpolate(t("rebuildLimited"), { limit, omitted })
      : "";

    return `${t("rebuiltCache")} ${summary}${limitedText}`;
  }

  global.FoxCloudRebuild = {
    formatRebuildStatus,
    interpolate,
  };
})(globalThis);
