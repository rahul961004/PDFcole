'use client';

import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';

interface FileUploadFormProps {
  onFileUpload: (file: File) => void;
}

const FileUploadForm: React.FC<FileUploadFormProps> = ({ onFileUpload }) => {
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        onFileUpload(file);
      } else {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF file.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="pdf-file">Upload PDF</Label>
      <Input id="pdf-file" type="file" accept=".pdf" onChange={handleFileChange} />
    </div>
  );
};

export default FileUploadForm;