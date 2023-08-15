export function formatBytes(bytes: number): string {
  const MB = 1024 * 1024; // 1 MB in bytes
  const GB = 1024 * MB; // 1 GB in bytes

  if (bytes < MB) {
    return `${bytes}B`;
  } else if (bytes < 999 * MB) {
    const sizeInMB = (bytes / MB).toFixed(0);
    return `${sizeInMB}MB`;
  } else {
    const sizeInGB = (bytes / GB).toFixed(1);
    return `${sizeInGB}GB`;
  }
}
