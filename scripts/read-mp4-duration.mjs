import fs from "node:fs/promises";

/** Best-effort MP4 duration (seconds) from moov/mvhd without ffprobe. */
export async function readMp4DurationSeconds(filePath) {
  const fd = await fs.open(filePath, "r");
  try {
    const stat = await fd.stat();
    const max = Math.min(stat.size, 48 * 1024 * 1024);
    const buf = Buffer.allocUnsafe(Math.min(max, 8 * 1024 * 1024));
    const { bytesRead } = await fd.read(buf, 0, buf.length, 0);
    const slice = buf.subarray(0, bytesRead);

    function parseMvhd(data, start, end) {
      if (end - start < 20) return null;
      const version = data[start];
      if (version === 1) {
        // version(1)+flags(3)+ctime(8)+mtime(8)+timescale(4)+duration(8)
        const offsetTimescale = start + 4 + 8 + 8;
        const offsetDuration = offsetTimescale + 4;
        if (offsetDuration + 8 > end) return null;
        const timescale = data.readUInt32BE(offsetTimescale);
        const duration = Number(data.readBigUInt64BE(offsetDuration));
        if (!timescale) return null;
        return duration / timescale;
      }
      // version 0: version(1)+flags(3)+ctime(4)+mtime(4)+timescale(4)+duration(4)
      const offsetTimescale = start + 4 + 4 + 4;
      const offsetDuration = offsetTimescale + 4;
      if (offsetDuration + 4 > end) return null;
      const timescale = data.readUInt32BE(offsetTimescale);
      const duration = data.readUInt32BE(offsetDuration);
      if (!timescale) return null;
      return duration / timescale;
    }

    function walk(data, start, end) {
      let o = start;
      while (o + 8 <= end) {
        const size = data.readUInt32BE(o);
        if (size < 8 || o + size > end) break;
        const type = data.toString("ascii", o + 4, o + 8);
        if (type === "moov") {
          const inner = walk(data, o + 8, o + size);
          if (inner != null) return inner;
        } else if (type === "mvhd") {
          const d = parseMvhd(data, o + 8, o + size);
          if (d != null) return d;
        }
        o += size;
      }
      return null;
    }

    const fromStart = walk(slice, 0, slice.length);
    if (fromStart != null) return fromStart;

    // moov may be at end of file — read tail
    const tailSize = Math.min(stat.size, 4 * 1024 * 1024);
    const tail = Buffer.allocUnsafe(tailSize);
    await fd.read(tail, 0, tailSize, stat.size - tailSize);
    return walk(tail, 0, tail.length);
  } finally {
    await fd.close();
  }
}
