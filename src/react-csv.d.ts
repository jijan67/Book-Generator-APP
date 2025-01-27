declare module 'react-csv' {
  import React from 'react';

  export interface CSVLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
    data: any[];
    headers?: any[];
    separator?: string;
    filename?: string;
    uFEFF?: boolean;
    target?: string;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    asyncOnClick?: boolean;
    className?: string;
    children?: React.ReactNode;
  }

  export class CSVLink extends React.Component<CSVLinkProps> {}
}
