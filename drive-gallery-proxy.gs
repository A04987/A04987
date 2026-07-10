function doGet(e) {
  const folderId = e.parameter.folderId;

  if (!folderId) {
    return jsonOutput({ files: [], error: 'Missing folderId' });
  }

  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFiles();
  const results = [];

  while (files.hasNext()) {
    const file = files.next();
    const mimeType = file.getMimeType();

    if (mimeType.indexOf('image/') !== 0) continue;

    results.push({
      id: file.getId(),
      title: file.getName().replace(/\.[^.]+$/, ''),
      mimeType: mimeType,
      updated: file.getLastUpdated().toISOString(),
    });
  }

  results.sort(function (a, b) {
    return a.title.localeCompare(b.title);
  });

  return jsonOutput({ files: results });
}

function jsonOutput(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
