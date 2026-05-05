(function attachCsvHelpers(global) {
  function escapeCsvValue(value) {
    let text = String(value ?? "");

    if (/^[=+\-@]/.test(text)) {
      text = `'${text}`;
    }

    if (/[",\n\r]/.test(text)) {
      return `"${text.replaceAll('"', '""')}"`;
    }

    return text;
  }

  global.FoxCloudCsv = {
    escapeCsvValue,
  };
})(globalThis);
