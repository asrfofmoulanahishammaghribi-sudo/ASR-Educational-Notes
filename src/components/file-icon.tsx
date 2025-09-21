import { FileText, FileImage, FileUp, FileSpreadsheet, FileDigit } from 'lucide-react';

interface FileIconProps {
  type: 'pdf' | 'word' | 'excel' | 'image' | 'other';
  className?: string;
}

export function FileIcon({ type, className = "h-5 w-5" }: FileIconProps) {
  switch (type) {
    case 'pdf':
      return <FileText className={className} />;
    case 'image':
      return <FileImage className={className} />;
    case 'word':
        return <FileDigit className={className} />;
    case 'excel':
        return <FileSpreadsheet className={className} />;
    default:
      return <FileUp className={className} />;
  }
}
