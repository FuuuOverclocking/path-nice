const bufferEncodingList = [
    'ascii',
    'utf8',
    'utf-8',
    'utf16le',
    'ucs2',
    'ucs-2',
    'base64',
    'latin1',
    'binary',
    'hex',
] as const;

export function isValidBufferEncoding(encoding: string): encoding is BufferEncoding {
    return bufferEncodingList.indexOf(encoding as any) !== -1;
}
