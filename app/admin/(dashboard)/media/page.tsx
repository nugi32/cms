import Image from "next/image";
import { listBlobsAction } from "@/app/admin/actions";
import DeleteBlobButton from "@/components/admin/DeleteBlobButton";

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export default async function MediaPage() {
  let blobs: Array<{ url: string; pathname: string; size: number; uploadedAt: Date }> = [];
  let error: string | null = null;

  try {
    blobs = await listBlobsAction();
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load media";
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title font-display">Media</h1>
      </div>

      <div className="admin-card">
        {error ? (
          <p className="field-error">{error}</p>
        ) : blobs.length === 0 ? (
          <p className="admin-empty-cell">No media files yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Name</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blobs.map((blob) => (
                  <tr key={blob.url}>
                    <td>
                      <a href={blob.url} target="_blank" rel="noreferrer">
                        <Image
                          src={blob.url}
                          alt={blob.pathname}
                          width={96}
                          height={96}
                          className="rounded object-cover"
                          unoptimized
                        />
                      </a>
                    </td>
                    <td className="font-mono">{blob.pathname}</td>
                    <td>{formatBytes(blob.size)}</td>
                    <td>{new Date(blob.uploadedAt).toLocaleString()}</td>
                    <td>
                      <DeleteBlobButton url={blob.url} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
