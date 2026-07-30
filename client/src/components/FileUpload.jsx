import { useRef, useState } from 'react';

export default function FileUpload({ files, onChange, multiple = true, accept }) {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (multiple) {
      onChange([...(files || []), ...newFiles]);
    } else {
      onChange(newFiles);
    }
    e.target.value = '';
  };

  const removeFile = (index) => {
    const updated = [...files];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div>
      <div
        className={`file-upload ${files?.length ? 'has-files' : ''}`}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          onChange={handleChange}
          multiple={multiple}
          accept={accept}
          style={{ display: 'none' }}
        />
        <p className="text-secondary text-sm">
          Click to upload files (max 10MB each)
        </p>
      </div>
      {files?.length > 0 && (
        <div className="file-list">
          {files.map((file, i) => (
            <div key={i} className="file-item">
              <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              <button type="button" onClick={() => removeFile(i)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
