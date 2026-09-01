export function extractStoragePath(
  url: string,
  bucketName: string,
): string | null {
  const marker = '/storage/v1/object/public/';
  const index = url.indexOf(marker);

  if (index === -1) {
    return null;
  }

  const path = decodeURIComponent(url.substring(index + marker.length));

  const bucketPrefix = `${bucketName}/`;

  if (!path.startsWith(bucketPrefix)) {
    return null;
  }

  return path.substring(bucketPrefix.length);
}
